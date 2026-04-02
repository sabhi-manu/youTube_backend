
import { asyncHandler } from "../utils/asycnHandler.js";
import commentService from "../services/comment.service.js";


export const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

   const result = await commentService.getVideoComments(videoId, page, limit)

    res.status(200).json({
        success: true,
        data: result.comments,
        pagination: result.pagination
    })
})

export const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const userId = req.user._id;
    const {content} = req.body;

  const comment = await commentService.addComment(videoId,userId,content)
    
    res.status(201).json({
        success: true,
        message: "Comment created successfully",
        data: comment
    })
})


export const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const userId = req.user._id;
    const content = req.body.content;

   const updateComment = await commentService.updateComment(commentId,userId,content)

    res.status(200).json({
        success:true,
        message:"comment update successfully.",
        data : updateComment
    })
})


export const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const userId = req.user._id;
        await commentService.deletComment(userId,commentId)

    res.status(200).json({
        success:true,
        message:"comment delete successfully."
    })

})
