const {Router}=require('express')
const router = Router();
const {verifyJWT,verifyPermission}=require('../../middlewares/auth.middleware.js')
const {addFooterLink,getSingleFooterLink,getAllFooterLink,editFooterLink,removeFooterLink} = require('../../controllers/footers/footer.controller.js')

router.route('/').post(verifyJWT,verifyPermission,addFooterLink)
router.route('/').delete(verifyJWT,verifyPermission,removeFooterLink)
router.route('/').patch(verifyJWT,verifyPermission,editFooterLink)
router.route('/all').get(verifyJWT,getAllFooterLink)
router.route('/').get(verifyJWT,verifyPermission,getSingleFooterLink)

module.exports=router