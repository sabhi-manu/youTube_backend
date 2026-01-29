import express from "express"
import { authMiddlewareJWT } from "../middlewares/auth.middleware"
import { getLikedVideos, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller"


const route = express.Router()

route.post("/toggle/v/:videoId",authMiddlewareJWT,toggleVideoLike)

route.post("/toggle/t/:tweetId",authMiddlewareJWT,toggleTweetLike)
route.post("/videos",authMiddlewareJWT,getLikedVideos)


export default route