const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    cupon_code:{
        type:String,
        required:true
    },
    discount_type:{
        type:String,
        required:true
    },
    number_of_cupon:{
        type:Number,
        required:true,
        default:1
    },
    cupon_valid_till:{
        type:Date,
        required:true, 
    },
    is_expired:{
        type:Boolean,
        default:false
    }
}, { timestamps: true })

module.exports = new mongoose.model('cupons', schema, 'cupons')