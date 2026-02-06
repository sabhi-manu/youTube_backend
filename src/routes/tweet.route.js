import express from "express"
import { authMiddlewareJWT } from "../middlewares/auth.middleware.js"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js"

const route = express.Router()
route.post("/",authMiddlewareJWT,createTweet)
route.get("/:userId",authMiddlewareJWT,getUserTweets)
route.patch("/:tweetId",authMiddlewareJWT,updateTweet)
route.delete("/:tweetId",authMiddlewareJWT,deleteTweet)

export default route