const jwt=require('jsonwebtoken')
const {asyncHandler}=require('../utils/asyncHandler.js')
const {ApiError} = require('../utils/ApiError.js')
const {env} = require('../env.js')
const blackListModel=require('../models/blacklisttoken.model.js')

exports.verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      throw new ApiError(401, "Invalid access token");
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

exports.verifyPermission = asyncHandler(async (req, res, next) => {
    if (!req.user?.user_id) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (req.user.role=="admin") {
      next();
    } else {
      throw new ApiError(403, "You are not allowed to perform this action");
    }
});

exports.verifyBlackList = asyncHandler(async (req, res, next) => {
    try {
        if(req.headers.authorization||req.cookies?.accessToken){
          const token =
          req.cookies?.accessToken ||
          req.headers.authorization?.replace("Bearer ", "");
            let result = await blackListModel.findOne({ access_token: token })
            if (result) {
                throw new ApiError(401, 'Token is Blacklisted')
            }
        }
            next();
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid access token");
    }
});
  