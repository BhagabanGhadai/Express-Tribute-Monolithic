const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const Cupon = require("../../models/cupons/cupon.model")
const moment = require('moment')

module.exports = {
    addCupon: asyncHandler(async (req, res) => {
        let cupon_code_unique = await Cupon.findOne({ cupon_code: req.body.cupon_code })
        if (cupon_code_unique) {
            throw new ApiError(400, "cupon already exists", []);
        }
        let current_date = moment(new Date())
        let cupon_validity_date = moment(req.body.cupon_valid_till)
        if (current_date > cupon_validity_date) {
            throw new ApiError(400, 'cupon validity date greater than current date')
        }
        const save_cupon = new Cupon(req.body)
        await save_cupon.save()
        return res.status(201).send(new ApiResponse(201, save_cupon, 'cupon created successfully'))
    }),
    getSingleCupon: asyncHandler(async (req, res) => {
        if (!req.query.cupon_id) {
            throw new ApiError(400, "cupon id required")
        }
        let cupon_details = await Cupon.findById(req.query.cupon_id)
        if (!cupon_details) {
            throw new ApiError(404, "no such cupon found")
        }
        return res.status(200).send(new ApiResponse(200, cupon_details, "cupon fetched successful"))
    }),
    getAllCupon: asyncHandler(async (req, res) => {
        let cupon_list = await Cupon.find({}).sort({ createdAt: -1 })
        if (!cupon_list.length) {
            throw new ApiError(404, "no such cupon found")
        }
        return res.status(200).send(new ApiResponse(200, cupon_list, "cupon list fetched successful"))
    }),
    editCupon: asyncHandler(async (req, res) => {
        if (!req.query.cupon_id) {
            throw new ApiError(400, "cupon id required")
        }
        let cupon_details = await Cupon.findById(req.query.cupon_id)

        if (req.body.cupon_code&&req.body.cupon_code==cupon_details.cupon_code) {
            throw new ApiError(404, "this cupon code already exist")
        }

        if(req.body.cupon_valid_till){
            let current_date = moment(new Date())
            let cupon_validity_date = moment(req.body.cupon_valid_till)
            if (current_date > cupon_validity_date) {
                throw new ApiError(400, 'cupon validity date greater than current date')
            }
        }
       
        let update_cupon = await Cupon.findByIdAndUpdate(req.query.cupon_id, req.body, { new: true })
        if (!update_cupon) {
            throw new ApiError(409, "error while update cupon")
        }
        return res.status(200).send(new ApiResponse(200, update_cupon, "cupon update successful"))
    }),
    removeCupon: asyncHandler(async (req, res) => {
        if (!req.query.cupon_id) {
            throw new ApiError(400, "cupon id required")
        }
        let cupon_details = await Cupon.findById(req.query.cupon_id)
        if (!cupon_details) {
            throw new ApiError(404, "no such cupon found")
        }
        await Cupon.findByIdAndDelete(req.query.cupon_id)
        return res
            .status(204)
            .json(new ApiResponse(204, "cupon deletion successfully"));
    }),
    cuponVerificationAndExpirationCheck: asyncHandler(async (req,res)=>{
        if (!req.body.cupon_code) {
            throw new ApiError(400, "cupon code required")
        }
        let cupon_details = await Cupon.findOne({cupon_code:req.body.cupon_code}).select("-number_of_cupon")
        if (!cupon_details) {
            throw new ApiError(404, "no such cupon found")
        }
        if(cupon_details.is_expired){
            throw new ApiError(400, 'cupon is expired')
        }
        let current_date = moment(new Date())
        let cupon_validity_date = moment(cupon_details.cupon_valid_till)
        if (current_date > cupon_validity_date) {
            await Cupon.findByIdAndUpdate(cupon_details._id,{$set:{is_expired:true}},{new:true})
            throw new ApiError(400, 'cupon is expired')
        }
        if(cupon_details.number_of_cupon==0){
            await Cupon.findByIdAndUpdate(cupon_details._id,{$set:{is_expired:true}},{new:true})
            throw new ApiError(400, 'cupon is expired')
        }
        return res.status(200).send(new ApiResponse(200,"cupon added successful"))
    })
}