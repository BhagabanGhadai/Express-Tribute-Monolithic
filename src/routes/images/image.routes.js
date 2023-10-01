const {Router}=require('express')
const router = Router();
const {UploadFile} = require('../../middlewares/multer.middleware.js')
const {verifyJWT,verifyPermission}=require('../../middlewares/auth.middleware.js')
const {addCoverPhoto,removeCoverPhoto,getCoverPhoto} = require('../../controllers/images/coverphotocontroller.js')
const {addBanner,removeBanner,getBanner} = require('../../controllers/images/dynamicbanner.controller.js')

router.route('/cover-photo').post(verifyJWT,verifyPermission,UploadFile.fields([{ name: 'cover_photo', maxCount: 1 }]),addCoverPhoto)
router.route('/cover-photo').delete(verifyJWT,verifyPermission,removeCoverPhoto)
router.route('/cover-photo').get(verifyJWT,getCoverPhoto)

router.route('/dynamic-banner').post(verifyJWT,verifyPermission,UploadFile.fields([{ name: 'dynamic_banner', maxCount: 1 }]),addBanner)
router.route('/dynamic-banner').delete(verifyJWT,verifyPermission,removeBanner)
router.route('/dynamic-banner').get(getBanner)

module.exports=router