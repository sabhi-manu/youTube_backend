import mongoose from "mongoose";
import { asyncHandler } from "../utils/asycnHandler.js";
import AppError from "../utils/Apperror.js";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";


export const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new AppError("video id not valid.", 400)
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new AppError("video not found", 404)
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: {
                    _id: "$owner._id",
                    userName: "$owner.userName",
                    fullName: "$owner.fullName",
                    avatar: "$owner.avatar"
                }
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) }

    ])
    const totalComments = await Comment.countDocuments({ video: videoId })

    res.status(200).json({
        success: true,
        data: comments,
        pagination: {
            totalComments,
            currentPage: Number(page),
            totalPages: Math.ceil(totalComments / Number(limit))
        }
    })
})

export const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const userId = req.user._id;
    const {content} = req.body;


    if(! mongoose.Types.ObjectId.isValid(videoId)){
        throw new AppError("video id not valid . ", 400)
    }

        const video = await Video.findById(videoId)
    if (!video) {
        throw new AppError("Video not found.", 404)
    }

    if(!content || !content.trim()){
         throw new AppError("content not provided . ", 400)
    }


    const comment = await Comment.create({
        content:content.trim(),
        owner : userId,
         video: videoId
    })
    if(!comment){
        throw new AppError("comment not create .",500)
    }
    res.status(201).json({
        success:true,
        message:"comment create successfully.",
        data:comment
    })
})


export const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const userId = req.user._id;
    const content = req.body.content;

    if(!mongoose.Types.ObjectId.isValid(commentId) ){
        throw new AppError("comment id not valid.",400)
    }
    if(!content || !content.trim()){
        throw new AppError("content not provided.",400)
    }

    const isComment = await Comment.findById(commentId)
    if(!isComment){
        throw new AppError("commenet not found .",404)
    }

    if(isComment.owner.toString() !== userId.toString() ){
        throw new AppError("UnAuthorized user .",400)
    }
    isComment.content = content.trim()
    await isComment.save()

    res.status(200).json({
        success:true,
        message:"comment update successfully.",
        data : isComment
    })
})


export const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const userId = req.user._id;

     if(!mongoose.Types.ObjectId.isValid(commentId) ){
        throw new AppError("comment id not valid.",400)
    }

     const isComment = await Comment.findById(commentId)
    if(!isComment){
        throw new AppError("commenet not found .",404)
    }

     if(isComment.owner.toString() !== userId.toString() ){
        throw new AppError("UnAuthorized user .",400)
    }


    await Comment.findByIdAndDelete(commentId)

    res.status(200).json({
        success:true,
        message:"comment delete successfully."
    })

})
