import express from "express"
import { authMiddlewareJWT } from "../middlewares/auth.middleware"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller"

const route = express.Router()
route.post("/",authMiddlewareJWT,createTweet)
route.get("/",authMiddlewareJWT,getUserTweets)
route.patch("/:tweetId",authMiddlewareJWT,updateTweet)
route.delete("/:tweetId",authMiddlewareJWT,deleteTweet)

export default route