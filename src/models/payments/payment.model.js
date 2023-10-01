const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user-details',
        required: true
    },
    plan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'plans',
        required: true
    },
    obituary_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'obituaries',
        required: true
    },
    cupon_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cupons',
    },
    payment_amount: {
        type: Number,
        required: true
    },
    order_id: {
        type: String,
        default: null
    },
    payment_id: {
        type: String,
        default: null
    },
    razorpay_signature_id: {
        type: String,
        default: null
    },
    payment_time: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    payment_mode: {
        type: String,
        enum: ['razorpay', 'other', 'cash'],
        default: 'razorpay'
    }
}, { timestamps: true })

module.exports = new mongoose.model('payments', schema, 'payments')