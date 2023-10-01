const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const Summary = require("../../models/obituary/summary.model")

module.exports = {
    addSummary: asyncHandler(async (req, res) => {
        const new_summary = new Summary(req.body)
        await new_summary.save()
        return res.status(201).send(new ApiResponse(201, new_summary, ' new summary added successfully'))
    }),
    getSingleSummary: asyncHandler(async (req, res) => {
        if (!req.query.summary_id) {
            throw new ApiError(400, "summary id required")
        }
        let summary_details = await Summary.findById(req.query.summary_id)
        if (!summary_details) {
            throw new ApiError(404, "no such summary found")
        }
        return res.status(200).send(new ApiResponse(200, summary_details, "summary fetched successful"))
    }),
    getAllSummary: asyncHandler(async (req, res) => {
        let summary_list = await Summary.find({}).sort({ createdAt: -1 })
        if (!summary_list.length) {
            throw new ApiError(404, "no summary found")
        }
        return res.status(200).send(new ApiResponse(200, summary_list, "Summary list fetched successful"))
    }),
    editSummary: asyncHandler(async (req, res) => {
        if (!req.query.summary_id) {
            throw new ApiError(400, "summary id required")
        }
        let summary_details = await Summary.findById(req.query.summary_id)
        if (!summary_details) {
            throw new ApiError(404, "no such summary found")
        }
       
        let update_summary = await Summary.findByIdAndUpdate(req.query.summary_id, req.body, { new: true })
        if (!update_summary) {
            throw new ApiError(409, "error while update cupon")
        }
        return res.status(200).send(new ApiResponse(200, update_summary, " update successful"))
    }),
    removeSummary: asyncHandler(async (req, res) => {
        if (!req.query.summary_id) {
            throw new ApiError(400, "summary id required")
        }
        let summary_details = await Summary.findById(req.query.summary_id)
        if (!summary_details) {
            throw new ApiError(404, "no such summary found")
        }
        await Summary.findByIdAndDelete(req.query.summary_id)
        return res
            .status(204)
            .json(new ApiResponse(204, "Summary deletion successfully"));
    })
}