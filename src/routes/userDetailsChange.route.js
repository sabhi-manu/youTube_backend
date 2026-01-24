import express from "express"
import { changeCurrentPassword, updateAccoutDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/userDetails.controller"
import { authMiddlewareJWT } from "../middlewares/auth.middleware"
import upload from "../middlewares/multer.middleware"

const route = express.Router()

route.post("")

route.post("/password",authMiddlewareJWT,changeCurrentPassword)
route.post("/user-details",authMiddlewareJWT,updateAccoutDetails)
route.post("/avatar",upload.single("avatar"),authMiddlewareJWT,updateUserAvatar)
route.post("/avatar",upload.single("coverImage"),authMiddlewareJWT,updateUserCoverImage)

export default route