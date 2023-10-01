const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const Plan = require("../../models/plans/plan.model")

module.exports = {
    addPlan: asyncHandler(async (req, res) => {
        const new_plan = new Plan(req.body)
        await new_plan.save()
        return res.status(201).send(new ApiResponse(201, new_plan, 'plan added successfully'))
    }),
    getSinglePlan: asyncHandler(async (req, res) => {
        if (!req.query.plan_id) {
            throw new ApiError(400, "plan id required")
        }
        let plan_details = await Plan.findById(req.query.plan_id)
        if (!plan_details) {
            throw new ApiError(404, "no such plan found")
        }
        return res.status(200).send(new ApiResponse(200, plan_details, "plan fetched successful"))
    }),
    getAllPlan: asyncHandler(async (req, res) => {
        let plan_list = await Plan.find({})
        if (!plan_list.length) {
            throw new ApiError(404, "no plan found")
        }
        return res.status(200).send(new ApiResponse(200, plan_list, "Plan list fetched successful"))
    }),
    editPlan: asyncHandler(async (req, res) => {
        if (!req.query.plan_id) {
            throw new ApiError(400, "plan id required")
        }
        let plan_details = await Plan.findById(req.query.plan_id)
        if (!plan_details) {
            throw new ApiError(404, "no such plan found")
        }
       
        let update_plan = await Plan.findByIdAndUpdate(req.query.plan_id, req.body, { new: true })
        if (!update_plan) {
            throw new ApiError(409, "error while update cupon")
        }
        return res.status(200).send(new ApiResponse(200, update_plan, "plan update successful"))
    }),
    removePlan: asyncHandler(async (req, res) => {
        if (!req.query.plan_id) {
            throw new ApiError(400, "plan id required")
        }
        let plan_details = await Plan.findById(req.query.plan_id)
        if (!plan_details) {
            throw new ApiError(404, "no such plan found")
        }
        await Plan.findByIdAndDelete(req.query.plan_id)
        return res
            .status(204)
            .json(new ApiResponse(204, "Plan deletion successfully"));
    })
}