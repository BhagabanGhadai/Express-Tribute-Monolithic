const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    summary:{
        type:String,
        required:true
     }
}, { timestamps: true })

module.exports = new mongoose.model('available-summaries', schema, 'available-summaries')