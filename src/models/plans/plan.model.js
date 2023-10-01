const mongoose = require('mongoose')

const schema = new mongoose.Schema({
   label:{
      type:String,
      required:true
   },
   amount:{
    type:Number
   },
   pointer:[String],
   is_free:{
      type:Boolean,
      default:false
   }
}, { timestamps: true })

module.exports = new mongoose.model('plans', schema, 'plans')