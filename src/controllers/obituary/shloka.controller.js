const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const Shloka = require("../../models/obituary/shloka.model")

module.exports = {
    addShloka: asyncHandler(async (req, res) => {
        const new_shloka = new Shloka(req.body)
        await new_shloka.save()
        return res.status(201).send(new ApiResponse(201, new_shloka, ' new shloka added successfully'))
    }),
    getSingleShloka: asyncHandler(async (req, res) => {
        if (!req.query.shloka_id) {
            throw new ApiError(400, "shloka id required")
        }
        let shloka_details = await Shloka.findById(req.query.shloka_id)
        if (!shloka_details) {
            throw new ApiError(404, "no such shloka found")
        }
        return res.status(200).send(new ApiResponse(200, shloka_details, "shloka fetched successful"))
    }),
    getAllShloka: asyncHandler(async (req, res) => {
        let shloka_list = await Shloka.find({}).sort({ createdAt: -1 })
        if (!shloka_list.length) {
            throw new ApiError(404, "no shloka found")
        }
        return res.status(200).send(new ApiResponse(200, shloka_list, "Shloka list fetched successful"))
    }),
    editShloka: asyncHandler(async (req, res) => {
        if (!req.query.shloka_id) {
            throw new ApiError(400, "shloka id required")
        }
        let shloka_details = await Shloka.findById(req.query.shloka_id)
        if (!shloka_details) {
            throw new ApiError(404, "no such footer element found")
        }
       
        let update_shloka = await Shloka.findByIdAndUpdate(req.query.shloka_id, req.body, { new: true })
        if (!update_shloka) {
            throw new ApiError(409, "error while update cupon")
        }
        return res.status(200).send(new ApiResponse(200, update_shloka, " update successful"))
    }),
    removeShloka: asyncHandler(async (req, res) => {
        if (!req.query.shloka_id) {
            throw new ApiError(400, "shloka id required")
        }
        let shloka_details = await Shloka.findById(req.query.shloka_id)
        if (!shloka_details) {
            throw new ApiError(404, "no such footer element found")
        }
        await Shloka.findByIdAndDelete(req.query.shloka_id)
        return res
            .status(204)
            .json(new ApiResponse(204, "Shloka deletion successfully"));
    })
}