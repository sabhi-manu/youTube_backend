import { asyncHandler } from "../utils/asycnHandler.js";
import videoService from "../services/video.service.js";
import { redisClient } from "../config/redis/redis.js";



export const getAllVideos = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    
    const cacheKey = `videos:page:${page}`;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("⚡ Cache HIT (videos list)");
      return res.status(200).json(JSON.parse(cachedData));
    }

    const result = await videoService.getAllVideos(req.query);

    const response = {
      success: true,
      data: result.videos,
      pagination: result.pagination,
    };

    // 3. Store in Redis
    await redisClient.set(cacheKey, JSON.stringify(response), "EX", 2 * 60);

    console.log(" Cache MISS (videos list)");

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const publishAVideo = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  await redisClient.del("videos:page:1");
  await redisClient.del(`user:${userId}:videos`);

  const video = await videoService.publishVideo(userId, req.body, req.files);
  res.status(201).json({
    success: true,
    message: "video published successfully.",
    data: video,
  });
});

export const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  const cacheKey = `video:${videoId}`;

  const cachedVideo = await redisClient.get(cacheKey);

  if (cachedVideo) {
    console.log(" Cache HIT (video)");
    return res.status(200).json(JSON.parse(cachedVideo));
  }

  const video = await videoService.getVideoById(videoId, userId);

  const response = {
    success: true,
    message: "Video fetched successfully",
    data: video,
  };

  await redisClient.set(cacheKey, JSON.stringify(response), "EX", 2 * 60);

  console.log("🐢 Cache MISS (video)");

  res.status(200).json({
    success: true,
    message: "Video fetched successfully",
    data: video,
  });
});

export const updateVideo = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { videoId } = req.params;

  await redisClient.del(`video:${videoId}`);
  await redisClient.del(`user:${userId}:videos`);
  const updateVideo = await videoService.updateVideo(
    userId,
    videoId,
    req.body,
    req.file,
  );

  res.status(200).json({
    success: true,
    message: "video details update successfully.",
    data: updateVideo,
  });
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  await redisClient.del(`video:${videoId}`);
  await redisClient.del(`user:${userId}:videos`);
  await redisClient.del("videos:page:1");

  await videoService.deleteVideo(videoId, userId);

  res.status(200).json({
    success: true,
    message: "Video deleted successfully",
  });
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  await redisClient.del(`video:${videoId}`);
  await redisClient.del("videos:page:1");
  const result = await videoService.togglePublishStatus(videoId, req.user._id);

  res.status(200).json({
    success: true,
    message: result.isPublished
      ? "Video published successfully"
      : "Video unpublished successfully",
    data: result,
  });
});

export const getUserVideo = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const cacheKey = `user:${userId}:videos`;

  const cachedVideos = await redisClient.get(cacheKey);

  if (cachedVideos) {
    console.log("⚡ Cache HIT (user videos)");
    return res.status(200).json(JSON.parse(cachedVideos));
  }

  const videos = await videoService.getUserVideos(userId);

  const response = {
    success: true,
    message: "User videos fetched successfully",
    data: videos,
  };

  await redisClient.set(cacheKey, JSON.stringify(response), "EX", 60);

  console.log("🐢 Cache MISS (user videos)");

  res.status(200).json(response);
});
