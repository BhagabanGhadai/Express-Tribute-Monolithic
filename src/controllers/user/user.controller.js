const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const User = require('../../models/user/user.model.js')
const { isPasswordCorrect, hashedPassword, generateAccessToken, generateRefreshToken, createOTP } = require("../../utils/helper.js")
const { env } = require('../../env.js')
const jwt = require('jsonwebtoken')
const blackListModel = require('../../models/blacklisttoken.model.js')
const moment = require('moment')
const { UPLOAD_IMAGE, DELETE_IMAGE } = require('../../utils/cloudinary')
const { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent } = require('../../utils/mail.js')


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating the access token"
        );
    }
};

module.exports = {
    registerUser: asyncHandler(async (req, res) => {
        if (req.files && req.files["avatar"]) {
            let upload = await UPLOAD_IMAGE(req.files.avatar[0]);
            req.body.avatar = {
                public_id: upload.public_id,
                url: upload.secure_url
            }
        }

        const existedUser = await User.findOne({ "email": req.body.email });

        if (existedUser) {
            throw new ApiError(409, "User with email already exists", []);
        }
        req.body.password = await hashedPassword(req.body.password)
        const user = await User.create(req.body);

        user.emailVerificationOTP = createOTP();
        user.emailVerificationExpiry = moment(new Date()).add(2, 'minutes').utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
        await user.save({ validateBeforeSave: false });

        await sendEmail({
            email: user?.email,
            subject: "OTP from Express Tributes",
            mailgenContent: emailVerificationMailgenContent(
                user.name,
                user.emailVerificationOTP
            ),
        });

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken -emailVerificationOTP -emailVerificationExpiry"
        );

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    createdUser,
                    "Users registered successfully and verification email has been sent on your email."
                )
            );
    }),
    loginUser: asyncHandler(async (req, res) => {

        if (!req.body.email) {
            throw new ApiError(400, "email is required");
        }
        if (!req.body.password) {
            throw new ApiError(400, "password is required");
        }
        const user = await User.findOne({ email: req.body.email, isEmailVerified: true });

        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        if (user.loginType !== "EMAIL_PASSWORD") {
            throw new ApiError(
                400,
                "You have previously registered using " +
                user.loginType?.toLowerCase() +
                ". Please use the " +
                user.loginType?.toLowerCase() +
                " login option to access your account."
            );
        }
        const isPasswordValid = await isPasswordCorrect(req.body.password, user.password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select(
            "-password -emailVerificationOTP -emailVerificationExpiry -forgotPasswordExpiry -forgotPasswordOTP"
        );

        const options = {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { user: loggedInUser, accessToken, refreshToken },
                    "User logged in successfully"
                )
            );
    }),
    logoutUser: asyncHandler(async (req, res) => {
        let refreshToken = req.body.refreshToken || req.cookies.refreshToken
        let accessToken = req.body.accessToken || req.cookies.accessToken
        blackListModel.create({ "refresh_token": refreshToken, "access_token": accessToken }).then(() => {
            const options = {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
            };

            return res
                .status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json(new ApiResponse(200, {}, "User logged out"));
        })

    }),
    verifyEmail: asyncHandler(async (req, res) => {
        if (!req.query.user_id) {
            throw new ApiError(400, "UserId is missing");
        }

        let user_details = await User.findOne({ "_id": req.query.user_id, "isEmailVerified": false }).exec()

        if (!user_details) {
            throw new ApiError(404, 'no such user found or may be the user alreday verified')
        }

        let current_time = moment(new Date())
        let token_exp_time = moment(user_details.emailVerificationExpiry)

        if (current_time > token_exp_time) {
            throw new ApiError(400, 'OTP expired!!')
        }

        if (user_details.emailVerificationOTP != req.body.otp) {
            throw new ApiError(400, 'invalid OTP')
        }
        await User.findOneAndUpdate({ "_id": req.query.user_id }, { isEmailVerified: true, emailVerificationOTP: null, emailVerificationExpiry: null }, { new: true });
        return res
            .status(200)
            .json(new ApiResponse(200, { isEmailVerified: true }, "Email is verified"));
    }),
    resendEmailVerification: asyncHandler(async (req, res) => {
        if (!req.query.user_id) {
            throw new ApiError(400, "UserId is missing");
        }
        const user = await User.findById(req.query.user_id);

        if (!user) {
            throw new ApiError(404, "User does not exists", []);
        }

        if (user.isEmailVerified) {
            throw new ApiError(409, "Email is already verified!");
        }

        user.emailVerificationOTP = createOTP();
        user.emailVerificationExpiry = moment(new Date()).add(2, 'minutes').utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
        await user.save({ validateBeforeSave: false });

        await sendEmail({
            email: user?.email,
            subject: "OTP from Express Tributes",
            mailgenContent: emailVerificationMailgenContent(
                user.name,
                user.emailVerificationOTP
            ),
        });
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Mail has been sent to your mail ID"));
    }),
    getCurrentUser: asyncHandler(async (req, res) => {
        if (!req.query.user_id) {
            throw new ApiError(400, "UserId is missing");
        }
        const user = await User.findOne({ _id: req.query.user_id }).select(
            "-role -password -loginType -isEmailVerified -emailVerificationExpiry -emailVerificationOTP -forgotPasswordExpiry -forgotPasswordOTP"
        )

        if (!user) {
            throw new ApiError(404, "User does not exists", []);
        }
        return res
            .status(200)
            .json(new ApiResponse(200, user, "Current user fetched successfully"));
    }),
    deleteUserByAdmin: asyncHandler(async (req, res) => {
        if (!req.query.user_id) {
            throw new ApiError(400, "UserId is missing");
        }
        const user = await User.findById(req.query.user_id);

        if (!user) {
            throw new ApiError(404, "User does not exists", []);
        }
        await DELETE_IMAGE(user.avatar.public_id)
        await User.findByIdAndDelete(req.query.user_id)
        return res
            .status(204)
            .json(new ApiResponse(204, "user deletion successfully"));
    }),
    editCurrentUser: asyncHandler(async (req, res) => {
        if (!req.user.user_id) {
            throw new ApiError(400, "UserId is missing");
        }
        const user = await User.findOne({ _id: req.user.user_id });

        if (!user) {
            throw new ApiError(404, "User does not exists", []);
        }
        if (req.body.password) {
            req.body.password = await hashedPassword(req.body.password)
        }
        if (req.body.email) {
            throw new ApiError(400, "email can't be updated");
        }
        if (req.files && req.files["avatar"]) {
            if (user?.avatar?.public_id) {
                await DELETE_IMAGE(user.avatar.public_id)
            }
            let upload = await UPLOAD_IMAGE(req.files.avatar[0]);
            req.body.avatar = {
                public_id: upload.public_id,
                url: upload.secure_url
            }
        }
        const update_user = await User.findOneAndUpdate({ _id: req.user.user_id }, req.body, { new: true })
        return res
            .status(200)
            .json(new ApiResponse(200, update_user, "user update successfully"));
    }),
    handleSocialLogin: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user?.user_id);

        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
            user._id
        );

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        };

        return res
            .status(301)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .redirect(
                `${env.CLIENT_SSO_REDIRECT_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`
            );
    }),
    refreshAccessToken: asyncHandler(async (req, res) => {
        let incomingRefreshToken =
            req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request");
        }
        incomingRefreshToken = incomingRefreshToken.replace("Bearer ", "");

        try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                env.REFRESH_TOKEN_SECRET
            );
            if (!decodedToken) {
                throw new ApiError(401, "invalid token");
            }
            const user = await blackListModel.findOne({ "refresh_token": incomingRefreshToken });
            if (user === "null") {
                throw new ApiError(401, "refresh token is Blacklisted");
            }

            const options = {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
            };

            const { accessToken, refreshToken } =
                await generateAccessAndRefreshTokens(decodedToken.user_id);

            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        { accessToken, refreshToken },
                        "Access token refreshed"
                    )
                );
        } catch (error) {
            throw new ApiError(401, error?.message || "Invalid refresh token");
        }
    }),
    forgotPasswordRequest: asyncHandler(async (req, res) => {
        const { email } = req.body;

        const user = await User.findOne({ email: email, isEmailVerified: true });

        if (!user) {
            throw new ApiError(404, "User does not exists", []);
        }

        user.forgotPasswordOTP = createOTP();
        user.forgotPasswordExpiry = moment(new Date()).add(2, 'minutes').utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
        await user.save({ validateBeforeSave: false });
        await sendEmail({
            email: user?.email,
            subject: "OTP from Express Tributes for Password reset request",
            mailgenContent: forgotPasswordMailgenContent(
                user.name,
                user.forgotPasswordOTP
            ),
        });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user._id,
                    "Password reset mail has been sent on your mail id"
                )
            );
    }),
    verifyEmailFogotPassword: asyncHandler(async (req, res) => {
        if (!req.query.user_id) {
            throw new ApiError(400, "UserId is missing");
        }

        let user_details = await User.findOne({ "_id": req.query.user_id, "isEmailVerified": true }).exec()

        if (!user_details) {
            throw new ApiError(404, 'no such user found or may be the user alreday verified')
        }

        let current_time = moment(new Date())
        let token_exp_time = moment(user_details.forgotPasswordExpiry)

        if (current_time > token_exp_time) {
            throw new ApiError(400, 'OTP expired!!')
        }

        if (user_details.forgotPasswordOTP != req.body.otp) {
            throw new ApiError(400, 'invalid OTP')
        }
        await User.findOneAndUpdate({ "_id": req.query.user_id }, { "$set": { isEmailVerified: true }, emailVerificationOTP: null, emailVerificationExpiry: null }, { new: true });
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "otp verified successful"));
    }),
    changePassword: asyncHandler(async (req, res) => {
        if (!req.query.user_id) {
            throw new ApiError(400, "UserId is missing");
        }
        const user = await User.findOne({ _id: req.query.user_id, isEmailVerified: true });

        if (!user) {
            throw new ApiError(404, "User does not exists", []);
        }
        if (req.body.password) {
            req.body.password = await hashedPassword(req.body.password)
        }
        const update_user = await User.findOneAndUpdate({ _id: req.query.user_id }, req.body, { new: true })
        return res
            .status(200)
            .json(new ApiResponse(200, "password changed successfully"));
    }),
    getAllUserByAdmin: asyncHandler(async (req, res) => {
        let page = 1
        if (req.query.page) {
            page = parseInt(req.query.page)
        }
    
        let page_size = 10
        if (req.query.page_size) {
            page_size = parseInt(req.query.page_size)
        }
        let pipeline = [
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: "obituary-profiles",
                    let: {
                        user_id: "$_id"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$user_id", "$$user_id"]
                                }
                            }
                        }
                    ],
                    // localField:"_id",
                    // foreignField:"user_id",
                    as: "obituary-profiles"
                }
            },
            {
                $lookup: {
                    from: "payments",
                    let: {
                        user_id: "$_id"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$user_id", "$$user_id"]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "plans",
                                localField:"plan_id",
                                foreignField:"_id",
                                as:"plans"
                            }
                        }
                    ],
                    as: "payments"
                }
            },
            {
                $addFields: {
                    "no_of_posts": { $size: "$obituary-profiles" },
                    "subscription":"$payments.plans.label"
                }
            },
            {
                $project:{
                    "name":1,
                    "email":1,
                    "createdAt":1,
                    "subscription":1,
                    "no_of_posts":1
                }
            }
        ]
        pipeline.push({ "$skip": (page - 1) * page_size }, { "$limit": page_size })
        let user_list = await User.aggregate(pipeline)
        if (!user_list.length) {
            throw new ApiError(404, "user list not found")
        }
        return res.status(200).send(new ApiResponse(200, user_list, "user list fetched successful"))
    })
}






