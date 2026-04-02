import mongoose from "mongoose"
import User from "../models/user.model.js"
import Video from "../models/video.model.js"


const findVideoById = async(videoId)=>{
    return await Video.findById(videoId)
}

const getAllVideos = async (matchCondition, sortCondition, skip, limit) => {

    const videos = await Video.aggregate([
        { $match: matchCondition },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            userName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$owner" },
        { $sort: sortCondition },
        { $skip: skip },
        { $limit: limit }
    ])

    const totalVideo = await Video.countDocuments(matchCondition)

    return { videos, totalVideo }
}

const createVideo = async (data)=>{
    return await Video.create(data)
}

const getVideoById = async (videoId, userId) => {

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
                isPublished: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            userName: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$user" },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLikedByCurrentUser: userId
                    ? {
                        $in: [
                            new mongoose.Types.ObjectId(userId),
                            "$likes.likedBy"
                        ]
                    }
                    : false
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ])

    return video
}


const addToWatchHistory = async (userId, videoId) => {
    return await User.findByIdAndUpdate(userId, {
        $addToSet: { watchHistory: videoId }
    })
}

const incrementViews = async (videoId) => {
    return await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    })
}

const updateVideo = async (videoId,updateData)=>{
  return  await Video.findByIdAndUpdate(videoId, {
        $set: updateData
    }, { new: true }
).select("-__v")
}

const deleteVideo = async (videoId)=>{
    return await Video.findByIdAndDelete(videoId)
}
const saveVideo = async (video) => {
    return await video.save()
}


const getVideosByUserId = async (userId) => {
    return await Video.find({ owner: userId })
        .sort({ createdAt: -1 })
}


export default {
    getAllVideos,
    createVideo,
    findVideoById,
    getVideoById,
    addToWatchHistory,
    incrementViews,
    updateVideo,
    deleteVideo,
    saveVideo,
    getVideosByUserId
}