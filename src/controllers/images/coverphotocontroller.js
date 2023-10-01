const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const {UPLOAD_IMAGE,DELETE_IMAGE} = require('../../utils/cloudinary')
const CoverPhoto = require("../../models/images/cover.photo.model")

module.exports = {
    addCoverPhoto: asyncHandler(async (req, res) => {
        if (!req.files && req.files["cover_photo"]) {
            throw new ApiError(409,'cover photo missing')
        }
        let upload = await UPLOAD_IMAGE(req.files.cover_photo[0]);
            req.body.cover_photo = {
                public_id:upload.public_id,
                url:upload.secure_url
            }
        const new_cover_photo = new CoverPhoto(req.body)
        await new_cover_photo.save()
        return res.status(201).send(new ApiResponse(201, new_cover_photo, 'Cover Photo added successfully'))
    }),
    getCoverPhoto: asyncHandler(async (req, res) => {
        let cover_photo_list = await CoverPhoto.find({}).sort({createdAt:-1})
        if (!cover_photo_list.length) {
            throw new ApiError(404, "no coverphot found")
        }
        return res.status(200).send(new ApiResponse(200, cover_photo_list, "cover photo list fetched successful"))
    }),
    removeCoverPhoto: asyncHandler(async (req, res) => {
        if (!req.query.cover_photo_id) {
            throw new ApiError(400, "cover photo id required")
        }
        let cover_photo_details = await CoverPhoto.findById(req.query.cover_photo_id)
        if (!cover_photo_details) {
            throw new ApiError(404, "no such cover photo found")
        }
        await DELETE_IMAGE(cover_photo_details.cover_photo.public_id)
        await CoverPhoto.findByIdAndDelete(req.query.cover_photo_id)
        return res
            .status(204)
            .json(new ApiResponse(204, "Cover Photo deletion successfully"));
    })
}