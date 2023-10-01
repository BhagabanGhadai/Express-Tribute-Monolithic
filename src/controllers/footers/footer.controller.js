const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const Footer = require("../../models/footer/footer.model")

module.exports = {
    addFooterLink: asyncHandler(async (req, res) => {
        const new_footer = new Footer(req.body)
        await new_footer.save()
        return res.status(201).send(new ApiResponse(201, new_footer, 'link added in footer successfully'))
    }),
    getSingleFooterLink: asyncHandler(async (req, res) => {
        if (!req.query.footer_id) {
            throw new ApiError(400, "footer id required")
        }
        let footer_details = await Footer.findById(req.query.footer_id)
        if (!footer_details) {
            throw new ApiError(404, "no such footer element found")
        }
        return res.status(200).send(new ApiResponse(200, footer_details, "footer element fetched successful"))
    }),
    getAllFooterLink: asyncHandler(async (req, res) => {
        let footer_element_list = await Footer.find({}).sort({ createdAt: -1 })
        if (!footer_element_list.length) {
            throw new ApiError(404, "no Footer Element found")
        }
        return res.status(200).send(new ApiResponse(200, footer_element_list, "Footer Element list fetched successful"))
    }),
    editFooterLink: asyncHandler(async (req, res) => {
        if (!req.query.footer_id) {
            throw new ApiError(400, "footer id required")
        }
        let footer_details = await Footer.findById(req.query.footer_id)
        if (!footer_details) {
            throw new ApiError(404, "no such footer element found")
        }
       
        let update_footer = await Footer.findByIdAndUpdate(req.query.footer_id, req.body, { new: true })
        if (!update_footer) {
            throw new ApiError(409, "error while update cupon")
        }
        return res.status(200).send(new ApiResponse(200, update_footer, " update successful"))
    }),
    removeFooterLink: asyncHandler(async (req, res) => {
        if (!req.query.footer_id) {
            throw new ApiError(400, "footer id required")
        }
        let footer_details = await Footer.findById(req.query.footer_id)
        if (!footer_details) {
            throw new ApiError(404, "no such footer element found")
        }
        await Footer.findByIdAndDelete(req.query.footer_id)
        return res
            .status(204)
            .json(new ApiResponse(204, "Footer element deletion successfully"));
    })
}