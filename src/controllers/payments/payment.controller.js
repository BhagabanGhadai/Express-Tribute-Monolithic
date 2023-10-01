const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const Payment = require("../../models/payments/payment.model")
const Plan = require("../../models/plans/plan.model")
const Obituary = require("../../models/obituary/obituary.model")
const Cupon = require("../../models/cupons/cupon.model")
const User = require("../../models/user/user.model")
const crypto=require('crypto')
const {env} = require('../../env')
const {razorpay_instance}= require('../../utils/razorpay')
const { default: mongoose } = require('mongoose')
const { sendEmailOnPayment ,sendEmail} = require('../../utils/mail.js')

module.exports = {
    initiatePayment: asyncHandler(async (req, res) => {
        if (!req.user.user_id) {
            throw new ApiError(400, ' user id is required')
        } else {
            req.body.user_id = req.user.user_id
        }
        if (!req.body.plan_id) {
            throw new ApiError(400, 'plan id is required')
        }
        let plan_details = await Plan.findById(req.body.plan_id)
        if (!plan_details) {
            throw new ApiError(404, "no such plan found")
        }
        if (!req.body.obituary_id) {
            throw new ApiError(400, 'obituary id is required')
        }
        let obituary_details = await Obituary.findById(req.body.obituary_id)
        if (!obituary_details) {
            throw new ApiError(404, "no such obituary profile found")
        }
        if (req.body.cupon_id) {
            let cupon_details = await Cupon.findById(req.body.cupon_id)
            if (!cupon_details) {
                throw new ApiError(404, "no such cupon found")
            }
        }


        let payment_object = new Payment(req.body)
        await payment_object.validate()

        const options = {
            amount: req.body.payment_amount * 100,
            currency: "INR",
            receipt: payment_object._id
        };

        let response = await razorpay_instance.orders.create(options)

        let updated_payment_object = await Payment.findOneAndUpdate({ _id: payment_object._id }, { order_id: response.id }, { new: true })
        return res.status(200).send(new ApiResponse(200, updated_payment_object, 'ordern initiated successful'))
    }),
    paymentVerification: asyncHandler(async (req, res) => {
        const body = req.body.order_id + "|" + req.body.razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');
        let datetime = new Date();
        const updated_body = {
            "order_id": req.body["razorpay_order_id"],
            "payment_id": req.body["razorpay_payment_id"],
            "razorpay_signature_id": req.body["razorpay_signature"],
            "payment_time": datetime,
            "status": "success"
        }
        let response = { "signatureIsValid": "false" }
        if (expectedSignature === req.body.razorpay_signature) {
            await Payment.findOneAndUpdate({ "order_id": req.body["razorpay_order_id"] },updated_body, { new: true });
            await Obituary.findOneAndUpdate({"_id":req.query.obituary_id},{$set:{is_free:false}},{new:true})
            response = { "signatureIsValid": "true" }
            
        }else{
            await Payment.findOneAndUpdate({ "order_id": req.body["razorpay_order_id"] },{status:"failed"}, { new: true });
        }
        return res.status(200).send(new ApiResponse(200,response,"payment update successful"))
    }),
    addpaymentManually: asyncHandler(async (req,res)=>{
        if (!req.body.user_id) {
            throw new ApiError(400, 'user id is required')
        }
        let user_details = await User.findById(req.body.user_id)
        if (!user_details) {
            throw new ApiError(404, "no such user found")
        }
        if (!req.body.plan_id) {
            throw new ApiError(400, 'plan id is required')
        }
        let plan_details = await Plan.findById(req.body.plan_id)
        if (!plan_details) {
            throw new ApiError(404, "no such plan found")
        }
        if (!req.body.obituary_id) {
            throw new ApiError(400, 'obituary id is required')
        }
        let obituary_details = await Obituary.findById(req.body.obituary_id)
        if (!obituary_details) {
            throw new ApiError(404, "no such obituary profile found")
        }

        req.body.status="success"
        let payment_object = new Payment(req.body)
        await payment_object.save()
        await Obituary.findOneAndUpdate({_id:req.body.obituary_id},{$set:{is_free:false}},{new:true})
        await sendEmail({
            email: user_details?.email,
            subject: "we recieved you payments",
            mailgenContent: sendEmailOnPayment(
                user_details.name,
                plan_details.label,
                plan_details.pointer,
                payment_object.payment_amount
            ),
        });
        return res.status(200).send(new ApiResponse(200,payment_object,"payment added successful"))
    }),
    getAllPaymentAdmin: asyncHandler(async (req, res)=>{
        let page = 1
        if (req.query.page) {
            page = parseInt(req.query.page)
        }
    
        let page_size = 10
        if (req.query.page_size) {
            page_size = parseInt(req.query.page_size)
        }
        let pipeline=[
            {
                $sort:{payment_time:-1}
            },
            {
                $lookup:{
                    from:"user-details",
                    localField:"user_id",
                    foreignField:"_id",
                    as:"user-details"
                }
            }
        ]
        if(req.query.user_id){
            pipeline.push({
                $match:{
                    user_id:new mongoose.Types.ObjectId(req.query.user_id)
                }
            })
        }
        if(req.query.plan_id){
            pipeline.push({
                $match:{
                    plan_id:new mongoose.Types.ObjectId(req.query.plan_id)
                }
            })
        }
        if(req.query.obituary_id){
            pipeline.push({
                $match:{
                    obituary_id:new mongoose.Types.ObjectId(req.query.obituary_id)
                }
            })
        }
        if(req.query.cupon_id){
            pipeline.push({
                $match:{
                    cupon_id:new mongoose.Types.ObjectId(req.query.obituary_id)
                }
            })
        }
        if(req.query.user){
            pipeline.push({
                $match:{
                    "user-details.slug":new req.query.user
                }
            })
        }
        if(req.query.status){
            pipeline.push({
                $match:{
                    status:req.query.status
                }
            })
        }
        if(req.query.payment_mode){
            pipeline.push({
                $match:{
                    payment_mode:req.query.payment_mode
                }
            })
        }
        pipeline.push(
            {
                $project:{
                    "payment_mode":1,
                    "status":1,
                    "payment_time":1,
                    "razorpay_signature_id":1,
                    "payment_amount":1,
                    "order_id":1,
                    "payment_id":1,
                    "user_id":1,
                    "user-details.name":1
                }
            }
        )
        pipeline.push({ "$skip": (page - 1) * page_size }, { "$limit": page_size })
        let payment_list=await Payment.aggregate(pipeline)
        if(!payment_list.length){
            throw new ApiError(404,'no payment infromation found')
        }
        return res.status(200).send(new ApiResponse(200,payment_list,'payment infromation fetched successful'))
    })
}