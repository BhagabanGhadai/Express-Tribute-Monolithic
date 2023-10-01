const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user-details',
        required: true
    },
    obituary_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'obituaries',
        required: true
    },
    name:{
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    message:{
        type:String,
        Required:true
    },
    memories:[
        {
            tribute_image:Object
        }
    ]
}, { timestamps: true })

module.exports = new mongoose.model('tributes', schema, 'tributes')