const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    'access_token': {
        type: String,
        required: true
    },
    'refresh_token': {
        type: String,
        required: true
    },
    createdAt:{ type: Date, expires: 10, default: Date.now }
})
schema.index({createdAt: 1},{expireAfterSeconds: 10});
module.exports = new mongoose.model('black-list-tokens', schema, 'black-list-tokens')