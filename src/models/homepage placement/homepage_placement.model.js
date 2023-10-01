const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    placement_data:{
        type:mongoose.Schema.Types.Mixed
    }
}, { timestamps: true })

module.exports = new mongoose.model('homepage-placement', schema, 'homepage-placement')