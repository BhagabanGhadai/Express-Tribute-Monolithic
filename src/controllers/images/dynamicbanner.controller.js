const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const {UPLOAD_IMAGE,DELETE_IMAGE} = require('../../utils/cloudinary')
const DynamicBanner = require("../../models/images/dynamic.banner.model")

module.exports = {
    addBanner: asyncHandler(async (req, res) => {
        if (!req.files && req.files["dynamic_banner"]) {
            throw new ApiError(409,'banner image missing')
        }
        let upload = await UPLOAD_IMAGE(req.files.dynamic_banner[0]);
            req.body.dynamic_banner = {
                public_id:upload.public_id,
                url:upload.secure_url
            }
        const new_banner = new DynamicBanner(req.body)
        await new_banner.save()
        return res.status(201).send(new ApiResponse(201, new_banner, 'Banner added successfully'))
    }),
    getBanner: asyncHandler(async (req, res) => {
        let banner = await DynamicBanner.find({})
        if (!banner.length) {
            throw new ApiError(404, "no banner found")
        }
        return res.status(200).send(new ApiResponse(200, banner, "banner fetched successful"))
    }),
    removeBanner: asyncHandler(async (req, res) => {
        if (!req.query.banner_id) {
            throw new ApiError(400, "banner id required")
        }
        let banner_details = await DynamicBanner.findById(req.query.banner_id)
        if (!banner_details) {
            throw new ApiError(404, "no such banner found")
        }
        await DELETE_IMAGE(banner_details.dynamic_banner.public_id)
        await DynamicBanner.findByIdAndDelete(req.query.banner_id)
        return res
            .status(204)
            .json(new ApiResponse(204, "Banner deletion successfully"));
    })
}