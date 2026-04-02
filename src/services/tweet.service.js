import mongoose from "mongoose"
import tweetRepository from "../repositories/tweet.repository.js"
import AppError from "../utils/Apperror.js"



const createTweet = async ({content,userId})=>{

    if(!content || !content.trim()){
        throw new AppError ("content is required",400)
    }

    const tweet = await tweetRepository.createTweetRepo({userId,content:content.trim()

    })

     const populatedTweet = await tweetRepository.getTweetWithOwnerRepo(tweet._id);

    return {
        ...populatedTweet.toObject(),
        likeCount: 0,
        isLiked: false,
    };

}

const getUserTweets = async (userId)=>{

    const tweets = await tweetRepository.getUserTweet(userId)

    return tweets
}

const updateTweet = async ({tweetId,content,userId})=>{
   
      if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new AppError("Invalid tweet id.", 400)
    }
    if (!content || !content.trim()) {
        throw new AppError("content not provide.", 400)
    }
    const tweet = await tweetRepository.getTweetById(tweetId)

    if(!tweet){
        throw new AppError("tweet not found.",404)
    }

     if (tweet.owner.toString() !== userId.toString()) {
        throw new AppError("You are not allowed to update this tweet.", 403)
    }
  
    const updateTweet = await tweetRepository.updateTweetRepo(tweetId,content)
    
    return updateTweet
}

const deleteTweet = async ({tweetId,userId})=>{
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new AppError("Invalid tweet id.", 400)
    }
    const tweet = await tweetRepository.getTweetById(tweetId)
    
    if (!tweet) {
            throw new AppError("Tweet not found.", 404)
        }
        if (tweet.owner.toString() !== userId.toString()) {
            throw new AppError("You are not allowed to update this tweet.", 403)
        }

     await tweetRepository.deleteTweetRepo(tweetId)

     return true
}

export default {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}

