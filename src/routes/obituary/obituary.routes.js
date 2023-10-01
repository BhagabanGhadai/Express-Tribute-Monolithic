const {Router}=require('express')
const router = Router();
const {UploadFile} = require('../../middlewares/multer.middleware.js')
const {verifyJWT,verifyPermission}=require('../../middlewares/auth.middleware.js')
const {addTitle,getSingleTitle,getAllTitle,editTitle,removeTitle} = require('../../controllers/obituary/title.controller.js')
const {addShloka,getSingleShloka,getAllShloka,editShloka,removeShloka} = require('../../controllers/obituary/shloka.controller.js')
const {addSummary,getSingleSummary,getAllSummary,editSummary,removeSummary} = require('../../controllers/obituary/summary.controller.js')
const {addTribute,removeTribute,getTributeOfaUser} = require('../../controllers/obituary/tribute.controller.js')
const {addBiography,editBiography,removeBiography,getAllBiography,getSingleBiography} = require('../../controllers/obituary/biography.controller.js')
const {addObituaryProfile,editObituaryProfile,increaseProfileView,getObituaryAllProfileView,
    getSingleObituaryProfileView,removeObituaryProfile,getSingleObituaryProfileTemplateView,
    addProfileForHomePagePlacement,getProfileForHomePagePlacement,removeProfileForHomePagePlacement} = require('../../controllers/obituary/obituary.controller.js')

/**predefined title api's */
router.route('/title').post(verifyJWT,verifyPermission,addTitle)
router.route('/title').delete(verifyJWT,verifyPermission,removeTitle)
router.route('/title').patch(verifyJWT,verifyPermission,editTitle)
router.route('/title/all').get(verifyJWT,getAllTitle)
router.route('/title').get(verifyJWT,getSingleTitle)

/**predefine summary api's */
router.route('/summary').post(verifyJWT,verifyPermission,addSummary)
router.route('/summary').delete(verifyJWT,verifyPermission,removeSummary)
router.route('/summary').patch(verifyJWT,verifyPermission,editSummary)
router.route('/summary/all').get(verifyJWT,getAllSummary)
router.route('/summary').get(verifyJWT,getSingleSummary)

/**predine shloka api's */
router.route('/shloka').post(verifyJWT,verifyPermission,addShloka)
router.route('/shloka').delete(verifyJWT,verifyPermission,removeShloka)
router.route('/shloka').patch(verifyJWT,verifyPermission,editShloka)
router.route('/shloka/all').get(verifyJWT,getAllShloka)
router.route('/shloka').get(verifyJWT,getSingleShloka)

/**tribute api's */
router.route('/tribute').post(verifyJWT,UploadFile.fields([{ name: 'tribute_image', maxCount: 5 }]),addTribute)
router.route('/tribute').delete(verifyJWT,removeTribute)
router.route('/tribute').get(verifyJWT,getTributeOfaUser)

/**biography api's */
router.route('/biography').post(verifyJWT,UploadFile.fields([{ name: 'biography_image', maxCount: 5 }]),addBiography)
router.route('/biography').patch(verifyJWT,UploadFile.fields([{ name: 'biography_image', maxCount: 5 }]),editBiography)
router.route('/biography').delete(verifyJWT,removeBiography)
router.route('/biography').get(verifyJWT,getSingleBiography)
router.route('/biography/all').get(verifyJWT,getAllBiography)

/**obitiuary profile api's */
router.route('/obitiuary-profile').post(verifyJWT,UploadFile.fields([{ name: 'profile_image', maxCount: 1 },{ name: 'obituary_image', maxCount: 50 }]),addObituaryProfile)
router.route('/obitiuary-profile').patch(verifyJWT,UploadFile.fields([{ name: 'profile_image', maxCount: 1 },{ name: 'obituary_image', maxCount: 50 }]),editObituaryProfile)
router.route('/obitiuary-profile/view').patch(verifyJWT,increaseProfileView)
router.route('/obitiuary-profile/all').get(getObituaryAllProfileView)
router.route('/obitiuary-profile').get(verifyJWT,getSingleObituaryProfileView)
router.route('/obitiuary-profile').delete(verifyJWT,removeObituaryProfile)
router.route('/obitiuary-profile/preview').get(verifyJWT,getSingleObituaryProfileTemplateView)

/**homepage placement Api's */
router.route('/homepage-placement').post(verifyJWT,verifyPermission,addProfileForHomePagePlacement)
router.route('/homepage-placement').get(addProfileForHomePagePlacement)
router.route('/homepage-placement').delete(verifyJWT,verifyPermission,addProfileForHomePagePlacement)
module.exports=router