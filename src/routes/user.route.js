import express from "express"
import { getCurrentUser, getUserChannelProfile, getWatchHistoryController, refreshTOkenController, userLoginController, userLogoutController, userRegisterController } from "../controllers/user.controller.js"
import upload from "../middlewares/multer.middleware.js"
import { authMiddlewareJWT } from "../middlewares/auth.middleware.js"
import schemaValidator from "../middlewares/schemaValidator.js"
import { registerUserSchema } from "../validations/user.validation.js"


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
]), schemaValidator(registerUserSchema), userRegisterController)

route.post("/login",userLoginController)
route.post('/logout',authMiddlewareJWT,userLogoutController)

route.post("/refresh_token",refreshTOkenController)
route.get("/curret_user",authMiddlewareJWT,getCurrentUser)
route.get("/channel_profile/:username",authMiddlewareJWT,getUserChannelProfile)
route.get("/history",authMiddlewareJWT,getWatchHistoryController)
export default route