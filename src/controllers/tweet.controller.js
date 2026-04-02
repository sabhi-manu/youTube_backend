import { asyncHandler } from "../utils/asycnHandler.js";
import tweetService from "../services/tweet.service.js";


export const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;
 const data = await tweetService.createTweet({content,userId})
 
 res.status(201).json({
        success: true,
        message: "Tweet created successfully.",
        data
    });
});


export const getUserTweets = asyncHandler(async (req, res) => {
    
    const {userId} = req.params
    
    const tweets = await tweetService.getUserTweets(userId)

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

const tweet = await tweetService.updateTweet({tweetId,content,userId})


console.log("check the update content after==>",tweet)
    res.status(200).json({
        success: true,
        message: "tweet update successfully.",
        data: tweet
    })
})


export const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id

    await tweetService.deleteTweet({tweetId,userId}) 
   
    res.status(200).json({
        success: true,
        message: "tweet delete successfully.",

    })

})

