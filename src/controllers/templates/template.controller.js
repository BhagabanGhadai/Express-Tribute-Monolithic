const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const Template = require("../../models/templates/template.model")
const {UPLOAD_IMAGE,DELETE_IMAGE} = require('../../utils/cloudinary')

module.exports = {
    addTemplate: asyncHandler(async (req, res) => {
        if (!req.files && req.files["template_preview"]) {
            throw new ApiError(409,'template preview missing')
        }
        let upload = await UPLOAD_IMAGE(req.files.template_preview[0]);
            req.body.template_preview = {
                public_id:upload.public_id,
                url:upload.secure_url
            }
        const new_template = new Template(req.body)
        await new_template.save()
        return res.status(201).send(new ApiResponse(201, new_template, 'Template added successfully'))
    }),
    getSingleTemplate: asyncHandler(async (req, res) => {
        if (!req.query.template_id) {
            throw new ApiError(400, "template id required")
        }
        let template_details = await Template.findById(req.query.template_id)
        if (!template_details) {
            throw new ApiError(404, "no such template found")
        }
        return res.status(200).send(new ApiResponse(200, template_details, "Template fetched successful"))
    }),
    getAllTemplate: asyncHandler(async (req, res) => {
        let template_list = await Template.find({}).sort({ createdAt: -1 })
        if (!template_list.length) {
            throw new ApiError(404, "no template found")
        }
        return res.status(200).send(new ApiResponse(200, template_list, "Template list fetched successful"))
    }),
    editTemplate: asyncHandler(async (req, res) => {
        if (!req.query.template_id) {
            throw new ApiError(400, "template id required")
        }
        if (!req.files && req.files["template_preview"]) {
            let upload = await UPLOAD_IMAGE(req.files.template_preview[0]);
            req.body.template_preview = {
                public_id:upload.public_id,
                url:upload.secure_url
            }
        }

        let template_details = await Template.findById(req.query.template_id)
        if (!template_details) {
            throw new ApiError(404, "no such template found")
        }
       
        let update_template = await Template.findByIdAndUpdate(req.query.template_id, req.body, { new: true })
        if (!update_template) {
            throw new ApiError(409, "error while update template")
        }
        return res.status(200).send(new ApiResponse(200, update_template, " update successful"))
    }),
    removeTemplate: asyncHandler(async (req, res) => {
        if (!req.query.template_id) {
            throw new ApiError(400, "template id required")
        }
        let template_details = await Template.findById(req.query.template_id)
        if (!template_details) {
            throw new ApiError(404, "no such template found")
        }
        await DELETE_IMAGE(template_details.template_preview.public_id)
        await Template.findByIdAndDelete(req.query.template_id)
        return res
            .status(204)
            .json(new ApiResponse(204, "Template deletion successfully"));
    })
}