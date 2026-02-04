import { asyncHandler } from "../utils/asycnHandler.js"
import AppError from "../utils/Apperror.js"
import Video from "../models/video.model.js"
import User from "../models/user.model.js"
import mongoose from "mongoose"
import Subscription from "../models/subscription.model.js"

export const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { channelId } = req.params;
    const currentUserId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new AppError("Invalid channel id.", 400);
    }


    if (channelId.toString() !== currentUserId.toString()) {
        throw new AppError("UnAuthorized .", 403)
    }

    const videoStats  = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId),
                isPublished: true
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            }
        },
         {
            $addFields: {
                likeCount: { $size: "$likes" }
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: "$likeCount" }
            }
        }
    ])

     const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    });

       const stats = {
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: videoStats[0]?.totalLikes || 0,
        totalSubscribers
    };

     res.status(200).json({
        success:true,
        data:stats
     })
})

export const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const currentUserId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new AppError("Invalid channel id.", 400);
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new AppError("Channel not found.", 404);
    }

    // 🔥 If viewer is NOT the owner → show only published videos
    const matchStage = {
        owner: new mongoose.Types.ObjectId(channelId)
    };

    if (!currentUserId || currentUserId.toString() !== channelId.toString()) {
        matchStage.isPublished = true;
    }

    const videos = await Video.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        }
    ]);

    const totalVideos = await Video.countDocuments(matchStage);

    res.status(200).json({
        success: true,
        data: videos,
        pagination: {
            totalVideos,
            currentPage: Number(page),
            totalPages: Math.ceil(totalVideos / limit)
        }
    });
});
