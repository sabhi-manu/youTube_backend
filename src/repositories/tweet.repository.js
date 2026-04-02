import mongoose from "mongoose";
import Tweet from "../models/tweet.model.js"



const createTweetRepo = async ({userId,content})=>{
   return await Tweet.create({
        owner: userId,
        content
      })
}

const getTweetWithOwnerRepo = async (tweetId) => {
    return await Tweet.findById(tweetId).populate("owner", "userName avatar");
};


const getUserTweet = async (userId)=>{
   return await Tweet.aggregate([
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
}


const getTweetById = async (tweetId)=>{
    return await Tweet.findById(tweetId)
}

 const updateTweetRepo = async (tweetId, data) => {
    return await Tweet.findByIdAndUpdate(tweetId, {content:data}, { new: true });
};

 const deleteTweetRepo = async (tweetId) => {
    return await Tweet.findByIdAndDelete(tweetId);
};

export default {
    createTweetRepo,
    getTweetWithOwnerRepo,
    getUserTweet,
    getTweetById,
    updateTweetRepo,
    deleteTweetRepo
}