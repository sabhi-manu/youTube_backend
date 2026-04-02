import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";
import Video from "../models/video.model.js";


 const getChannelStatsAgg = (channelId) => {
    return Video.aggregate([
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
                as: "likes"
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
    ]);
};

 const countSubscribers = (channelId) => {
    return Subscription.countDocuments({
        channel: new mongoose.Types.ObjectId(channelId)
    });
};

const getChannelVideosAgg = (channelId, isOwner, page, limit) => {

    const matchStage = {
        owner: new mongoose.Types.ObjectId(channelId)
    };

    if (!isOwner) {
        matchStage.isPublished = true;
    }

    return Video.aggregate([
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
};

 const countChannelVideos = (channelId, isOwner) => {

    const query = {
        owner: new mongoose.Types.ObjectId(channelId)
    };

    if (!isOwner) {
        query.isPublished = true;
    }

    return Video.countDocuments(query);
};

export default {
    getChannelStatsAgg,
    countSubscribers,
    getChannelVideosAgg,
    countChannelVideos
}