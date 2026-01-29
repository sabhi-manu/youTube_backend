import express from "express"
import { authMiddlewareJWT } from "../middlewares/auth.middleware"
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller"

const route = express.Router()

route.get("/stats/:channelId",authMiddlewareJWT,getChannelStats)
route.get("/videos/:channelId",authMiddlewareJWT,getChannelVideos)

export default route