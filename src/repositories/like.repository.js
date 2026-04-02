import mongoose from "mongoose";
import Like from "../models/like.model.js";



 const findLike = (query) => {
    return Like.findOne(query);
};

 const createLike = (data) => {
    return Like.create(data);
};

 const deleteLike = (id) => {
    return Like.findByIdAndDelete(id);
};


const getLikedVideosAgg = (userId, page, limit) => {
    return Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true }
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    { $match: { isPublished: true } },
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
                                        avatar: 1,
                                        _id: 0
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                            duration: 1,
                            views: 1,
                            owner: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$videos" },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) }
    ]);
};

 const countLikedVideos = (userId) => {
    return Like.countDocuments({
        likedBy: userId,
        video: { $exists: true }
    });
};

export default {
 findLike,
 createLike,
 deleteLike,
 getLikedVideosAgg,
 countLikedVideos
}