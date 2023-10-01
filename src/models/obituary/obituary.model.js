const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    platfrom_type:{
        type:String,
        enum:["person","pet"],
        default:"person"
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user-details',
        required: true
    },
    title_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user-details'
    },
    summary_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user-details'
    },
    shloka_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user-details'
    },
    name:{
        type:String,
        required:true
    },
    profile_image:{
        type:Object
    },
    slug:{
        type:String
    },
    dob:{
        type:String
    },
    passed_away_on:{
        type:String
    },
    religion:{
        type:String,
        enum:['Hindu','Muslim','Buddhism']
    },
    prayer_meeting_date:{
        type:Date
    },
    prayer_meeting_time:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    address:{
        type:String
    },
    life_summary:{
        type:String
    },
    biography:{
        type:String
    },
    remembered_by:{
        type:String
    },
    memories:[{obituary_image:Object}],
    template_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'templates'
    },
    cover_photo_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cover-photos'
    },
    views:{
        type:Number,
        default:0
    },
    is_free:{
        type:Boolean,
        default:true
    },
    status:{
        type:String,
        enum:["initiated","completed"],
        default:"initiated"
    },
    template_link:{
        type:Object
    }
}, { timestamps: true })

module.exports = new mongoose.model('obituary-profiles', schema, 'obituary-profiles')