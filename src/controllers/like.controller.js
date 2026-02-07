import { asyncHandler } from "../utils/asycnHandler.js";
import AppError from "../utils/Apperror.js";
import Like from "../models/like.model.js"
import mongoose from "mongoose";
import Video from "../models/video.model.js";
import Tweet from "../models/tweet.model.js";

export const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new AppError("invalid video id.", 400)
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new AppError("Video not found.", 404)
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    if (existingLike) {
        await existingLike.deleteOne();

        return res.status(200).json({
            success: true,
            liked: false,
            message: "Video unliked successfully."
        });
    }

    await Like.create({
        video: videoId,
        likedBy: userId
    });

    res.status(200).json({
        success: true,
        liked: true,
        message: "Video liked successfully."
    });

})

export const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new AppError("invalid tweet id.", 400)
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new AppError("tweet not found.", 404)
    }

    const existingTweet = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    });

    if (existingTweet) {
        await existingTweet.deleteOne();

        return res.status(200).json({
            success: true,
            liked: false,
            message: "Tweet unliked successfully."
        });
    }

    await Like.create({
        tweet: tweetId,
        likedBy: userId
    });

    res.status(200).json({
        success: true,
        liked: true,
        message: "Tweet liked successfully."
    });
})

export const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const {page=1,limit=10} = req.query;
console.log("get like video controller ==>",userId)
    const likedVideos = await Like.aggregate([
        {
            $match: { likedBy:new mongoose.Types.ObjectId(userId) }
        },
         {
            $sort: { createdAt: -1 } 
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                     {
                        $match: { isPublished: true }
                    },
                    {
                        $lookup: {
                           from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                         fullName:1,
                                        userName:1,
                                        avatar:1,
                                        _id:0
                                    }
                                }
                            ]
                        }
                    },
                    {
                         $addFields:{
                            owner:{$first:"$owner"}
                        }
                    },
                     {
                        $project: {
                            title: 1,
                            description:1,
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
        {
            $unwind: "$videos"
        },
       
        { $skip: (Number(page) - 1) * Number(limit) },
        {$limit:Number(limit)}
    ])

      const totalLikedVideos = await Like.countDocuments({
        likedBy: userId,
        video: { $exists: true }
    });

    res.status(200).json({
       success: true,
        message: "Liked videos fetched successfully.",
        data: likedVideos,
        pagination: {
            totalLikedVideos,
            currentPage: Number(page),
            totalPages: Math.ceil(totalLikedVideos / limit)
        }
    })

})