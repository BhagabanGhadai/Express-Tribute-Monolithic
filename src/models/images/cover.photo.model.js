const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    cover_photo:{
        type:Object,
        required:true
    }
}, { timestamps: true })

module.exports = new mongoose.model('cover-photos', schema, 'cover-photos')