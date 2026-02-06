import express from "express"
import { deleteVideo, getAllVideos, getUserVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js" 
import upload from "../middlewares/multer.middleware.js"
import { authMiddlewareJWT } from "../middlewares/auth.middleware.js"

const route = express.Router()

route.use(authMiddlewareJWT)

route.get("/", getAllVideos)
route.post("/", upload.fields([
    {
        name: "video",
        maxCount: 1,
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
        ]),
        publishAVideo
    
    )
    route.get("/:videoId",getVideoById)
    route.delete("/:videoId",deleteVideo)
    route.patch("/:videoId",upload.single("thumbnail"),updateVideo)
    route.patch("/toggle/publish/:videoId",togglePublishStatus)
     route.get("/user/:userId",getUserVideo)
export default route