import express from "express"
import { authMiddlewareJWT } from "../middlewares/auth.middleware.js"
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js"

const route = express.Router()

route.use(authMiddlewareJWT)
route.post("/c/:channelId",toggleSubscription)
route.get("/c/:channelId",getUserChannelSubscribers)
route.get("/u/:subscriberId",getSubscribedChannels)

export default route