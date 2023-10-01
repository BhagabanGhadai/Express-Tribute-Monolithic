const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    link:{
        type:String,
        required:true
    }
}, { timestamps: true })

module.exports = new mongoose.model('footer-links', schema, 'footer-links')