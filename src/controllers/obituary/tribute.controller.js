const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const Tribute = require("../../models/obituary/tribute.model")
const Obituary = require("../../models/obituary/obituary.model")
const {UPLOAD_MULTIPLE_IMAGE,DELETE_IMAGE} = require("../../utils/cloudinary")

module.exports = {
    addTribute: asyncHandler(async (req, res) => {
        if (req.files && req.files["tribute_image"]) {
            upload = await UPLOAD_MULTIPLE_IMAGE(req.files.tribute_image)
        }

        if(!req.user.user_id){
            throw new ApiError(409,'user id not found')
        }else{
            req.body.user_id=req.user.user_id
        }
        if(!req.body.obituary_id){
            throw new ApiError(400,'obituary id required')
        }
        let obituary_details=await Obituary.findById(req.body.obituary_id)
        if(!obituary_details){
            throw new ApiError(404,'no such obituary profile found')
        }
        let images_list=[]
        upload.forEach((x)=>{
            images_list.push({
                tribute_image:{public_id:x.public_id,url:x.secure_url}
            })
        })
        req.body.memories=await images_list
        const new_tribute = new Tribute(req.body)
        await new_tribute.save()
        return res.status(201).send(new ApiResponse(201, new_tribute, ' new tribute added successfully'))
    }),
    removeTribute: asyncHandler(async (req, res) => {
        if (!req.query.tribute_id) {
            throw new ApiError(400, "tribute id required")
        }
        let tribute_details = await Tribute.findById(req.query.tribute_id)
        if (!tribute_details) {
            throw new ApiError(404, "no such tribute found")
        }
        tribute_details.memories.forEach(async(x)=>{
            await DELETE_IMAGE(x.tribute_image.public_id)
        })
        await Tribute.findByIdAndDelete(req.query.tribute_id)
        return res
            .status(204)
            .json(new ApiResponse(204, "Tribute deletion successfully"));
    }),
    getTributeOfaUser:asyncHandler(async (req,res)=>{
        if(!req.user.user_id){
            throw new ApiError(400,'user id is missing')
        }
        let posted_tribute_list=await Tribute.find({user_id:req.user.user_id})
        if(!posted_tribute_list){
            throw new ApiError(404,'no tribute posted yet')
        }
        return res.status(200).send(new ApiResponse(200,posted_tribute_list,'Posted Tribute Fetched SuccessFul'))
    })
}