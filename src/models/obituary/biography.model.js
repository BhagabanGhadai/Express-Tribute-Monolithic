const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    obituary_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'obituaries',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user-details',
        required: true
    },
    title:{
        type:String
    },
    narration:{
        type:String
    },
    memories:[{biography_image:Object}]
}, { timestamps: true })

module.exports = new mongoose.model('biography', schema, 'biography')