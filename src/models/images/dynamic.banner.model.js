const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    dynamic_banner:{
        type:Object,
        required:true
    }
}, { timestamps: true })

module.exports = new mongoose.model('dynamic-banners', schema, 'dynamic-banners')