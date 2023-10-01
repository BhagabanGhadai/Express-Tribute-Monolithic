const {Router}=require('express')
const router = Router();
const {UploadFile} = require('../../middlewares/multer.middleware.js')
const {verifyJWT,verifyPermission}=require('../../middlewares/auth.middleware.js')
const {addTemplate,getSingleTemplate,getAllTemplate,editTemplate,removeTemplate} = require('../../controllers/templates/template.controller.js')

router.route('/').post(verifyJWT,verifyPermission,UploadFile.fields([{ name: 'template_preview', maxCount: 1 }]),addTemplate)
router.route('/').delete(verifyJWT,verifyPermission,removeTemplate)
router.route('/').patch(verifyJWT,verifyPermission,UploadFile.fields([{ name: 'template_preview', maxCount: 1 }]),editTemplate)
router.route('/all').get(verifyJWT,getAllTemplate)
router.route('/').get(verifyJWT,getSingleTemplate)

module.exports=router