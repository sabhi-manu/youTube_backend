import mongoose from "mongoose"
import Comment from "../models/comment.model.js"




const getVideoComments = async(videoId,page,limit)=>{
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

    return {comments,totalComments}

}

const createComment = async (data)=>{
   return await Comment.create(data)
}

const findCommentById = async (commentId)=>{

   return await Comment.findById(commentId)
}

const saveComment = async (comment) => {
    return await comment.save()
}

const deleteCommentById = async (commentId)=>{
    return await Comment.findByIdAndDelete(commentId)
}

export default {
    getVideoComments,
    createComment,
    findCommentById,
    saveComment,
    deleteCommentById
}