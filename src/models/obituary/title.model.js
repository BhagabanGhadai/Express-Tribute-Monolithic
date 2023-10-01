const mongoose = require('mongoose')

const schema = new mongoose.Schema({
 title:{
    type:String,
    required:true
 }
}, { timestamps: true })

module.exports = new mongoose.model('available-titles', schema, 'available-titles')