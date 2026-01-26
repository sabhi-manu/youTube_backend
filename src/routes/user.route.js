import express from "express"
import { getCurrentUser, getUserChannelProfile, getWatchHistory, refreshTOkenController, userLoginController, userLogoutController, userRegisterController } from "../controllers/user.controller.js"
import upload from "../middlewares/multer.middleware.js"
import { authMiddlewareJWT } from "../middlewares/auth.middleware.js"


const route = express.Router()

route.post("/register", upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:"1"
    }
]) ,userRegisterController)

route.post("/login",userLoginController)
route.post('/logout',authMiddlewareJWT,userLogoutController)

route.post("/refresh_token",refreshTOkenController)
route.get("/curret-user",authMiddlewareJWT,getCurrentUser)
route.get("/channel_profile",authMiddlewareJWT,getUserChannelProfile)
route.get("/history",authMiddlewareJWT,getWatchHistory)
export default route