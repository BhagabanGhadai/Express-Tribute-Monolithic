const {Router}=require('express')
const router = Router();
const {verifyJWT}=require('../../middlewares/auth.middleware.js')
const {initiatePayment,paymentVerification,addpaymentManually,getAllPaymentAdmin} = require('../../controllers/payments/payment.controller.js')

router.route('/initiate').post(verifyJWT,initiatePayment)
router.route('/verify').post(verifyJWT,paymentVerification)
router.route('/admin/add').post(verifyJWT,addpaymentManually)
router.route('/').get(verifyJWT,getAllPaymentAdmin)

module.exports=router