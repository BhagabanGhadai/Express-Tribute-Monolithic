const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    avatar: {
        type:Object
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        required: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    loginType: {
        type: String,
        enum: ["GOOGLE","EMAIL_PASSWORD"],
        default: "EMAIL_PASSWORD",
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    forgotPasswordOTP: {
        type: String,
    },
    forgotPasswordExpiry: {
        type: Date,
    },
    emailVerificationOTP: {
        type: String,
    },
    emailVerificationExpiry: {
        type: Date,
    },
}, { timestamps: true })

module.exports = new mongoose.model('user-details', schema, 'user-details')