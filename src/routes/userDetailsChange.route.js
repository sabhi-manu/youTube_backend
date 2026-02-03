import express from "express"
import { changeCurrentPassword, updateAccoutDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/userDetails.controller.js"
import { authMiddlewareJWT } from "../middlewares/auth.middleware.js"
import upload from "../middlewares/multer.middleware.js"

const route = express.Router()



route.post("/password",authMiddlewareJWT,changeCurrentPassword)
route.patch("/profile",authMiddlewareJWT,updateAccoutDetails)
route.patch("/avatar",upload.single("avatar"),authMiddlewareJWT,updateUserAvatar)
route.patch("/coverimage",upload.single("coverImage"),authMiddlewareJWT,updateUserCoverImage)

export default route