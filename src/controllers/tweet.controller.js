import { asyncHandler } from "../utils/asycnHandler.js";
import appError from "../utils/Apperror.js"
import Tweet from "../models/tweet.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";


export const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || !content.trim()) {
    throw new AppError("Content is required.", 400);
  }

  // Create tweet
  const tweet = await Tweet.create({
    owner: userId,
    content: content.trim(),
  });

  // Populate owner for frontend
  const populatedTweet = await Tweet.findById(tweet._id)
    .populate("owner", "userName avatar");

  res.status(201).json({
    success: true,
    message: "Tweet created successfully.",
    data: {
      ...populatedTweet.toObject(),
      likeCount: 0,
      isLiked: false,
    },
  });
});


export const getUserTweets = asyncHandler(async (req, res) => {
    
    const {userId} = req.params
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
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
        { $unwind: "$owner" },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
            }
        },

        {
            $addFields: {
                likeCount: { $size: "$likes" },
                isLiked: {
                    $in: [
                        new mongoose.Types.ObjectId(userId),
                        "$likes.likedBy"
                    ]
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        },
        {
            $sort: { createdAt: -1 }
        }

    ])

    res.status(200).json({
        success: true,
        message: "tweet fetch successfully.",
        data: tweets
    })

})


export const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user._id


    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new appError("Invalid tweet id.", 400)
    }
    if (!content || !content.trim()) {
        throw new appError("content not provide.", 400)
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new appError("tweet not found.", 404)
    }

    if (tweet.owner.toString() !== userId.toString()) {
        throw new appError("You are not allowed to update this tweet.", 403)
    }

    tweet.content = content.trim()
    await tweet.save()


    res.status(200).json({
        success: true,
        message: "tweet update successfully.",
        data: tweet
    })
})


export const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new appError("Invalid tweet id.", 400)
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new appError("Tweet not found.", 404)
    }
    if (tweet.owner.toString() !== userId.toString()) {
        throw new appError("You are not allowed to update this tweet.", 403)
    }
    const tweetDelete = await Tweet.findByIdAndDelete(tweetId)
    res.status(200).json({
        success: true,
        message: "tweet delete successfully.",

    })

})

