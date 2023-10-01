const {Router}=require('express')
const router = Router();
const {verifyJWT,verifyPermission}=require('../../middlewares/auth.middleware.js')
const {addCupon,getSingleCupon,getAllCupon,editCupon,removeCupon,cuponVerificationAndExpirationCheck} = require('../../controllers/cupons/cupon.controller.js')

router.route('/').post(verifyJWT,verifyPermission,addCupon)
router.route('/').delete(verifyJWT,verifyPermission,removeCupon)
router.route('/').patch(verifyJWT,verifyPermission,editCupon)
router.route('/all').get(verifyJWT,getAllCupon)
router.route('/').get(verifyJWT,getSingleCupon)
router.route('/verification-expiration-check').post(verifyJWT,cuponVerificationAndExpirationCheck)

module.exports=router