const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { env } = require('../env')

exports.isPasswordCorrect = async function (password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
};
exports.hashedPassword = async function (password) {
    return await bcrypt.hash(password, env.SALT_ROUND);
};
exports.generateAccessToken = function (user) {
    return jwt.sign(
        {
            user_id: user._id,
            email: user.email,
            role: user.role,
            iat: Date.now() / 1000
        },
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: env.ACCESS_TOKEN_EXPIRY }
    );
};

exports.generateRefreshToken = function (user) {
    return jwt.sign(
        {
            user_id: user._id,
        },
        env.REFRESH_TOKEN_SECRET,
        { expiresIn: env.REFRESH_TOKEN_EXPIRY }
    );
};


exports.generateTemporaryToken = function () {
    const unHashedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");
    const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

    return { unHashedToken, hashedToken, tokenExpiry };
};

exports.createOTP=()=>{
    return Math.floor(1000+Math.random()*9000)
};