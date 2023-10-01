const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const Title = require("../../models/obituary/title.model")

module.exports = {
    addTitle: asyncHandler(async (req, res) => {
        const new_title = new Title(req.body)
        await new_title.save()
        return res.status(201).send(new ApiResponse(201, new_title, ' new title added successfully'))
    }),
    getSingleTitle: asyncHandler(async (req, res) => {
        if (!req.query.title_id) {
            throw new ApiError(400, "title id required")
        }
        let title_details = await Title.findById(req.query.title_id)
        if (!title_details) {
            throw new ApiError(404, "no such title found")
        }
        return res.status(200).send(new ApiResponse(200, title_details, "title fetched successful"))
    }),
    getAllTitle: asyncHandler(async (req, res) => {
        let title_list = await Title.find({}).sort({ createdAt: -1 })
        if (!title_list.length) {
            throw new ApiError(404, "no title found")
        }
        return res.status(200).send(new ApiResponse(200, title_list, "Title list fetched successful"))
    }),
    editTitle: asyncHandler(async (req, res) => {
        if (!req.query.title_id) {
            throw new ApiError(400, "title id required")
        }
        let title_details = await Title.findById(req.query.title_id)
        if (!title_details) {
            throw new ApiError(404, "no such title found")
        }
       
        let update_title = await Title.findByIdAndUpdate(req.query.title_id, req.body, { new: true })
        if (!update_title) {
            throw new ApiError(409, "error while update cupon")
        }
        return res.status(200).send(new ApiResponse(200, update_title, " update successful"))
    }),
    removeTitle: asyncHandler(async (req, res) => {
        if (!req.query.title_id) {
            throw new ApiError(400, "title id required")
        }
        let title_details = await Title.findById(req.query.title_id)
        if (!title_details) {
            throw new ApiError(404, "no such title found")
        }
        await Title.findByIdAndDelete(req.query.title_id)
        return res
            .status(204)
            .json(new ApiResponse(204, "Title deletion successfully"));
    })
}