const {Router}=require('express')
const router = Router();
const {verifyJWT,verifyPermission}=require('../../middlewares/auth.middleware.js')
const {addPlan,removePlan,editPlan,getAllPlan,getSinglePlan} = require('../../controllers/plans/plan.controller.js')

router.route('/').post(verifyJWT,verifyPermission,addPlan)
router.route('/').delete(verifyJWT,verifyPermission,removePlan)
router.route('/').patch(verifyJWT,verifyPermission,editPlan)
router.route('/all').get(verifyJWT,getAllPlan)
router.route('/').get(verifyJWT,getSinglePlan)

module.exports=router