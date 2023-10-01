const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    shloka:{
        type:String,
        required:true
     }
}, { timestamps: true })

module.exports = new mongoose.model('available-shlokas', schema, 'available-shlokas')