const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const Biography = require("../../models/obituary/biography.model")
const Obituary = require("../../models/obituary/obituary.model")
const {UPLOAD_MULTIPLE_IMAGE,DELETE_IMAGE} = require("../../utils/cloudinary")
const { default: mongoose } = require('mongoose')
const { pipeline } = require('nodemailer/lib/xoauth2')

module.exports = {
    addBiography: asyncHandler(async (req, res) => {
        if(!req.user.user_id){
            throw new ApiError(400,'user id required')
        }else{
            req.body.user_id=req.user.user_id
        }
        if(!req.body.obituary_id){
            throw new ApiError(400,'obituary id required')
        }
        let obituary_details = await Obituary.findById(req.body.obituary_id)
        if (!obituary_details) {
            throw new ApiError(404, "no such obituary found")
        }
        if (req.files && req.files["biography_image"]) {
            upload = await UPLOAD_MULTIPLE_IMAGE(req.files.biography_image)
            let images_list=[]
            upload.forEach((x)=>{
                images_list.push({
                    biography_image:{public_id:x.public_id,url:x.secure_url}
                })
            })
            req.body.memories=await images_list
        }

        const new_biography = new Biography(req.body)
        await new_biography.save()
        return res.status(201).send(new ApiResponse(201, new_biography, ' new biography added successfully'))
    }),
    getSingleBiography: asyncHandler(async (req, res) => {
        let pipeline=[
            {
                $lookup:{
                    from:"obituary-profiles",
                    localField:"obituary_id",
                    foreignField:"_id",
                    as:"obituary-profiles"
                }
            }
        ]
        if (req.query.biography_id) {
            pipeline.push({
                $match:{
                    _id:new mongoose.Types.ObjectId(req.query.biography_id)
                }
            })
        }
        if (req.query.user) {
            pipeline.push({
                $match:{
                    "obituary-profiles.slug":req.query.user
                }
            })
        }
        pipeline.push({
            $project:{
                "title":1,
                "narration":1,
                "memories":1,
                "obituary-profiles.name":1
            }
        })
        let biography_details = await Biography.aggregate(pipeline)
        if (!biography_details) {
            throw new ApiError(404, "no such biography found")
        }
        return res.status(200).send(new ApiResponse(200, biography_details, "biography fetched successful"))
    }),
    getAllBiography: asyncHandler(async (req, res) => {
        let pipeline=[
            {
                $sort:{createdAt:-1}
            }
        ]
        if(req.query.obituary_id){
            pipeline.push({
                $match:{
                    obituary_id:new mongoose.Types.ObjectId(req.query.obituary_id)
                }
            })
        }
        if(req.query.user_id){
            pipeline.push({
                $match:{
                    user_id:new mongoose.Types.ObjectId(req.query.user_id)
                }
            })
        }
        let biography_list = await Biography.aggregate(pipeline)
        if (!biography_list.length) {
            throw new ApiError(404, "no biography found")
        }
        return res.status(200).send(new ApiResponse(200, biography_list, "Biography list fetched successful"))
    }),
    editBiography: asyncHandler(async (req, res) => {
        if (!req.query.biography_id) {
            throw new ApiError(400, "biography id required")
        }
        if(!req.user.user_id){
            throw new ApiError(400,'user id required')
        }else{
            req.body.user_id=req.user.user_id
        }
        if(req.body.obituary_id){
            let obituary_details = await Obituary.findById(req.body.obituary_id)
            if (!obituary_details) {
                throw new ApiError(404, "no such obituary found")
            }
        }
        let biography_details = await Biography.findById(req.query.biography_id)
        if (!biography_details) {
            throw new ApiError(404, "no such biography found")
        }
        if (req.files && req.files["biography_image"]) {
            upload = await UPLOAD_MULTIPLE_IMAGE(req.files.biography_image)
            let images_list=[]
            upload.forEach((x)=>{
                images_list.push({
                    biography_image:{public_id:x.public_id,url:x.secure_url}
                })
            })
            req.body.memories=await images_list
        }

        let update_biography = await Biography.findByIdAndUpdate(req.query.biography_id, req.body, { new: true })
        if (!update_biography) {
            throw new ApiError(409, "error while update cupon")
        }
        return res.status(200).send(new ApiResponse(200, update_biography, " update successful"))
    }),
    removeBiography: asyncHandler(async (req, res) => {
        if (!req.query.biography_id) {
            throw new ApiError(400, "biography id required")
        }
        let biography_details = await Biography.findById(req.query.biography_id)
        if (!biography_details) {
            throw new ApiError(404, "no such biography found")
        }
        biography_details.memories.forEach(async(x)=>{
            await DELETE_IMAGE(x.biography_image.public_id)
        })
        await Biography.findByIdAndDelete(req.query.biography_id)
        return res
            .status(204)
            .json(new ApiResponse(204, "Biography deletion successfully"));
    })
}
//question on edit api