const mongoose = require('mongoose')

const schema = new mongoose.Schema({
   html:{
    type:String,
    required:true
   },
   template_preview:{
      type:Object,
      required:true
   }
}, { timestamps: true })

module.exports = new mongoose.model('templates', schema, 'templates')