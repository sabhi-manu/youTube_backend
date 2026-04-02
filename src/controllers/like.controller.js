import likeService from "../services/like.service.js";
import { asyncHandler } from "../utils/asycnHandler.js";





export const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;
console.log("videoId:", videoId, "userId:", userId);

    const result = await likeService.toggleLike("video", videoId, userId);

    res.status(200).json(result);
});

export const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    const result = await likeService.toggleLike("tweet", tweetId, userId);

    res.status(200).json(result);
});



export const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const result = await likeService.getLikedVideos(userId, page, limit);

    res.status(200).json(result);
});