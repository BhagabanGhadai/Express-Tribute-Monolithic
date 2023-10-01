const { asyncHandler } = require('../../utils/asyncHandler')
const { ApiResponse } = require('../../utils/ApiResponse.js')
const { ApiError } = require('../../utils/ApiError.js')
const Obituary = require("../../models/obituary/obituary.model")
const Title = require("../../models/obituary/title.model")
const Summary = require("../../models/obituary/summary.model")
const Shloka = require("../../models/obituary/shloka.model")
const CoverPhoto = require("../../models/images/cover.photo.model")
const Template = require("../../models/templates/template.model")
const HomePagePlacement = require("../../models/homepage placement/homepage_placement.model")
const { UPLOAD_MULTIPLE_IMAGE, DELETE_IMAGE, UPLOAD_IMAGE, UPLOAD_BUFFER } = require("../../utils/cloudinary")
const slugify = require('slugify')
const { createOTP } = require('../../utils/helper')
const nodeHtmlToImage = require('node-html-to-image')
const { default: mongoose } = require('mongoose')
const moment = require('moment');
const today = moment();
const todayFormatted = today.format('DD-MM');


module.exports = {
    addObituaryProfile: asyncHandler(async (req, res) => {
        if (req.query.platfrom) {
            req.body.platfrom_type = req.query.platfrom
        }
        if (!req.user.user_id) {
            throw new ApiError(400, 'user id required')
        } else {
            req.body.user_id = req.user.user_id
        }

        let title_details = await Title.findById(req.body.title_id)
        if (!title_details) {
            throw new ApiError(404, "no such title found")
        }
        let summary_details = await Summary.findById(req.body.summary_id)
        if (!summary_details) {
            throw new ApiError(404, "no such summary found")
        }
        if (req.body.shloka_id) {
            let shloka_details = await Shloka.findById(req.body.shloka_id)
            if (!shloka_details) {
                throw new ApiError(404, "no such shloka found")
            }
        }

        req.body.slug = slugify(req.body.name, { lower: true }) + "-" + createOTP()


        const new_obituary_profile = new Obituary(req.body)
        await new_obituary_profile.save()
        return res.status(201).send(new ApiResponse(201, new_obituary_profile, ' new obituary profile added successfully'))
    }),
    editObituaryProfile: asyncHandler(async (req, res) => {
        if (!req.query.obituary_profile_id) {
            throw new ApiError(400, "obituary profile id required")
        }
        if (req.query.platfrom) {
            req.body.platfrom_type = req.query.platfrom
        }
        let obituary_details = await Obituary.findById(req.query.obituary_profile_id)
        if (!obituary_details) {
            throw new ApiError(404, "no such obituary profile found")
        }
        if (req.body.title_id) {
            let title_details = await Title.findById(req.body.title_id)
            if (!title_details) {
                throw new ApiError(404, "no such title found")
            }
        }
        if (req.body.summary_id) {
            let summary_details = await Summary.findById(req.body.summary_id)
            if (!summary_details) {
                throw new ApiError(404, "no such summary found")
            }
        }
        if (req.body.shloka_id) {
            let shloka_details = await Shloka.findById(req.body.shloka_id)
            if (!shloka_details) {
                throw new ApiError(404, "no such shloka found")
            }
        }
        if (req.body.template_id) {
            let template_details = await Template.findById(req.body.template_id)
            if (!template_details) {
                throw new ApiError(404, "no such template found")
            }
        }
        if (req.body.cover_photo_id) {
            let cover_photo_details = await CoverPhoto.findById(req.body.cover_photo_id)
            if (!cover_photo_details) {
                throw new ApiError(404, "no such cover photo found")
            }
        }
        if (req.body.name) {
            req.body.slug = slugify(req.body.name, { lower: true }) + "-" + createOTP()

        }
        if (req.files && req.files["profile_image"]) {
            var upload_profile_image = await UPLOAD_IMAGE(req.files.profile_image[0]);
            req.body.profile_image = {
                public_id: upload_profile_image.public_id,
                url: upload_profile_image.secure_url
            }
        }
        if (req.files && req.files["obituary_image"]) {
            let upload = await UPLOAD_MULTIPLE_IMAGE(req.files.obituary_image)
            let images_list = []
            upload.forEach((x) => {
                images_list.push({
                    obituary_image: { public_id: x.public_id, url: x.secure_url }
                })
            })
            req.body.memories = await images_list
        }
        let update_obitiuary_profile = await Obituary.findByIdAndUpdate(req.query.obituary_profile_id, req.body, { new: true })
        if (!update_obitiuary_profile) {
            throw new ApiError(409, "error while update cupon")
        }
        if (update_obitiuary_profile.status == "completed" && update_obitiuary_profile.template_id) {
            let template_details = await Template.findById(update_obitiuary_profile.template_id)
            let createImage = await nodeHtmlToImage({
                html: template_details.html,
                content: {
                    name: update_obitiuary_profile.name
                }
            })
            let uploadImage = await UPLOAD_BUFFER(createImage)

            let template_link = {
                public_id: uploadImage.public_id,
                url: uploadImage.secure_url
            }
            await Obituary.findByIdAndUpdate(req.query.obituary_profile_id, { template_link }, { new: true })

        }
        return res.status(200).send(new ApiResponse(200, update_obitiuary_profile, " update successful"))
    }),
    increaseProfileView: asyncHandler(async (req, res) => {
        if (!req.query.obituary_profile_id) {
            throw new ApiError(400, "obituary profile id required")
        }
        let obituary_details = await Obituary.findById(req.query.obituary_profile_id)
        if (!obituary_details) {
            throw new ApiError(404, "no such obituary profile found")
        }
        let update_obitiuary_profile = await Obituary.findByIdAndUpdate(req.query.obituary_profile_id, { $inc: { views: 1 } }, { new: true })
        if (!update_obitiuary_profile) {
            throw new ApiError(409, "error while update cupon")
        }
        return res.status(200).send(new ApiResponse(200, { views: update_obitiuary_profile.views }, " view added successful"))

    }),
    getObituaryAllProfileView: asyncHandler(async (req, res) => {
        let page = 1
        if (req.query.page) {
            page = parseInt(req.query.page)
        }

        let page_size = 10
        if (req.query.page_size) {
            page_size = parseInt(req.query.page_size)
        }
        let pipeline = [
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: "tributes",
                    localField: "_id",
                    foreignField: "obituary_id",
                    as: "tributes"
                }
            },
            {
                $addFields: {
                    "no_of_tribute": { $size: "$tributes" },
                    "no_of_photos": { $size: "$memories" }
                }
            }
        ]
        if (req.query.today == "true") {
            pipeline.push({
                $match: {
                    $expr: {
                        $eq: [{ $substr: ["$passed_away_on", 0, 5] }, todayFormatted]
                    }
                }
            }
            )
        }

        if (req.query.search) {
            pipeline.push({
                $match: { name: { $regex: ".*" + req.query.search + ".*", $options: 'i' } }
            })
        }
        if (req.query.user_id) {
            pipeline.push({
                $match: { user_id: new mongoose.Types.ObjectId(req.query.user_id) }
            })
        }
        if (req.query.user) {
            pipeline.push({
                $match: { slug: req.query.user }
            })
        }
        if (req.query.platfrom) {
            pipeline.push({
                $match: { platfrom_type: req.query.platfrom }
            })
        }
        if (req.query.public == "true") {
            pipeline.push({
                $match: { is_free: false }
            })
        }

        pipeline.push({
            $project: {
                "_id": 1,
                "name": 1,
                "profile_image": 1,
                "slug": 1,
                "dob": 1,
                "passed_away_on": 1,
                "views": 1,
                "no_of_tribute": 1,
                "no_of_photos": 1,
                "user_id": 1
            }
        })
        pipeline.push({ "$skip": (page - 1) * page_size }, { "$limit": page_size })
        let obituary_profile_list = await Obituary.aggregate(pipeline)
        if (!obituary_profile_list) {
            throw new ApiError(404, "no such obituary profile found")
        }
        return res.status(200).send(new ApiResponse(200, obituary_profile_list, "profiles fetched successful"))

    }),
    getSingleObituaryProfileView: asyncHandler(async (req, res) => {

        let pipeline = []
        if (req.query.obituary_profile_id) {
            pipeline.push(
                {
                    $match: { _id: new mongoose.Types.ObjectId(req.query.obituary_profile_id) }
                }
            )
        }
        if (req.query.user) {
            pipeline.push({
                $match: { slug: req.query.user }
            })
        }
        if (req.query.platfrom) {
            pipeline.push({
                $match: { platfrom_type: req.query.platfrom }
            })
        }
        pipeline.push(
            {
                $lookup: {
                    from: "available-titles",
                    localField: "title_id",
                    foreignField: "_id",
                    as: "title"
                }
            },
            {
                $lookup: {
                    from: "available-summaries",
                    localField: "summary_id",
                    foreignField: "_id",
                    as: "summary"
                }
            },
            {
                $lookup: {
                    from: "available-shlokas",
                    localField: "shloka_id",
                    foreignField: "_id",
                    as: "shloka"
                }
            },
            {
                $lookup: {
                    from: "biography",
                    localField: "_id",
                    foreignField: "obituary_id",
                    as: "carrer&biography"
                }
            },
            {
                $lookup: {
                    from: "tributes",
                    localField: "_id",
                    foreignField: "obituary_id",
                    as: "tributes"
                }
            },
            {
                $project: {
                    "platfrom_type": 0,
                    "status": 0,
                    "slug": 0,
                    "createdAt": 0,
                    "updatedAt": 0,
                    "__v": 0,
                    "template_id": 0,
                    "template_link": 0,
                    "title_id": 0,
                    "title._id": 0,
                    "title.createdAt": 0,
                    "title.updatedAt": 0,
                    "title.__v": 0,
                    "summary_id": 0,
                    "summary._id": 0,
                    "summary.createdAt": 0,
                    "summary.updatedAt": 0,
                    "summary.__v": 0,
                    "shloka_id": 0,
                    "shloka._id": 0,
                    "shloka.createdAt": 0,
                    "shloka.updatedAt": 0,
                    "shloka.__v": 0,
                    "tributes.obituary_id": 0,
                    "tributes.user_id": 0,
                    "tributes.createdAt": 0,
                    "tributes.updatedAt": 0,
                    "tributes.__v": 0,
                    "carrer&biography.obituary_id": 0,
                    "carrer&biography.user_id": 0,
                    "carrer&biography.createdAt": 0,
                    "carrer&biography.updatedAt": 0,
                    "carrer&biography.__v": 0
                }
            }
        )

        let obituary_profile_details = await Obituary.aggregate(pipeline)
        if (!obituary_profile_details) {
            throw new ApiError(404, "no such obituary profile found")
        }
        if (req?.user?.user_id != obituary_profile_details[0]["user_id"].toString() && obituary_profile_details[0].is_free) {
            throw new ApiError(404, "This Obitaury Profile Is Not Available For Public! Please Upgrade Your Plan")
        }
        return res.status(200).send(new ApiResponse(200, obituary_profile_details, "obituary profile fetched successful"))
    }),
    removeObituaryProfile: asyncHandler(async (req, res) => {
        if (!req.query.obituary_profile_id || req.query.user) {
            throw new ApiError(400, "obituary profile id or slug required")
        }
        let obituary_details = await Obituary.findOne({ $or: [{ _id: req.query.obituary_profile_id }, { slug: req.query.user }] })
        if (!obituary_details) {
            throw new ApiError(404, "no such obituary profile found")
        }
        obituary_details.memories.forEach(async (x) => {
            await DELETE_IMAGE(x.obituary_image.public_id)
        })
        await DELETE_IMAGE(obituary_details.profile_image.public_id)
        await Obituary.findByIdAndDelete(obituary_details._id)
        return res
            .status(204)
            .json(new ApiResponse(204, "obituary profile deletion successfully"));
    }),
    getSingleObituaryProfileTemplateView: asyncHandler(async (req, res) => {
        if (!req.query.obituary_profile_id) {
            throw new ApiError(400, "obituary profile id required")
        }
        let obituary_details = await Obituary.findById(req.query.obituary_profile_id)
        if (!obituary_details) {
            throw new ApiError(404, "no such obituary profile found")
        }
        if (obituary_details.is_free) {
            throw new ApiError(400, "upgrade your profile to get your template")
        }
        res.status(200).send(new ApiResponse(200, obituary_details.template_link, "template link fetched successful"))
    }),
    addProfileForHomePagePlacement: asyncHandler(async (req,res)=>{
        if(!req.body.placement_data.length){
            throw new ApiError(409,'please add profile home page')
        }
        let add_placement=await HomePagePlacement.create({placement_data:req.body.placement_data})
        if(!add_placement){
            throw new ApiError(400,'error while adding profile')
        }
        return res.status(200).send(new ApiResponse(200,add_placement,'profile added in homepage successful'))
    }),
    getProfileForHomePagePlacement: asyncHandler(async (req,res)=>{
        let homepage_profile_list=await HomePagePlacement.findOne({})
        if(!homepage_profile_list){
            throw new ApiError(404,'no homepage profile found')
        }
        return res.status(200).send(new ApiResponse(200,homepage_profile_list),'profile fetched succesful')
    }),
    removeProfileForHomePagePlacement: asyncHandler(async (req,res)=>{
        if(!req.query.homepage_placement_id){
            throw new ApiError(400,'homepage placement id is required')
        }
        let data=await HomePagePlacement.findOne({_id:req.query.homepage_placement_id})
        if(!data){
            throw new ApiError(404,'no homepage profile found')
        }
        await HomePagePlacement.findByIdAndDelete(homepage_placement_id)
        return res.status(204).json(new ApiResponse(204, "homepage profile deletion successfully"));
    })
}
