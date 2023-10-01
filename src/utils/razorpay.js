const {env} = require('../env')
const Razorpay = require('razorpay');

const instance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET
});

module.exports.razorpay_instance=instance