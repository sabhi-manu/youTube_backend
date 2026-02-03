import express from "express"
import { authMiddlewareJWT } from "../middlewares/auth.middleware.js"
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js"

const route = express.Router()

route.get("/:videoId",authMiddlewareJWT,getVideoComments)
route.post("/:videoId",authMiddlewareJWT,addComment)
route.patch("/:commentId",authMiddlewareJWT,updateComment)
route.delete("/:commentId",authMiddlewareJWT,deleteComment)

export default route