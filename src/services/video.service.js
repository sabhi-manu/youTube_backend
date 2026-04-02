import mongoose from "mongoose";
import videoRepository from "../repositories/video.repository.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import AppError from "../utils/Apperror.js";
import videoQueue from "../queues/videoqueue.js";

const getAllVideos = async (queryParams) => {
  const {
    query,
    page = 1,
    limit = 10,
    userId,
    sortBy = "createdAt",
    sortType = "desc",
  } = queryParams;

  const matchCondition = { isPublished: true };

  if (query) {
    matchCondition.title = { $regex: query, $options: "i" };
  }

  if (userId) {
    matchCondition.owner = new mongoose.Types.ObjectId(userId);
  }

  const sortCondition = {
    [sortBy]: sortType === "asc" ? 1 : -1,
  };

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const { videos, totalVideo } = await videoRepository.getAllVideos(
    matchCondition,
    sortCondition,
    skip,
    limitNum,
  );

  return {
    videos,
    pagination: {
      totalVideo,
      currentPage: pageNum,
      totalPages: Math.ceil(totalVideo / limitNum),
    },
  };
};

const publishVideo = async (userId, body, files) => {
  const { title, description } = body;

  if (!title?.trim() || !description?.trim()) {
    throw new AppError("Provide all details", 400);
  }
  console.log("publish video service ==>", title, description, files);

  const videoFile = files?.video?.[0]?.path;
  const thumbnailFile = files?.thumbnail?.[0]?.path;

  if (!videoFile) {
    throw new AppError("video file required.", 400);
  }

  if (!thumbnailFile) {
    throw new AppError("Thumbnail file required", 400);
  }

  console.log("video file ==>", videoFile);
  console.log("thumbnail file ==>", thumbnailFile);

  const video = await videoRepository.createVideo({
    owner: userId,
    title: title.trim(),
    description: description.trim(),
    status: "processing",
  });

  if (!video) {
    throw new AppError("video not published", 500);
  }

  await videoQueue.add(
    "process-video",
    {
      videoId: video._id,
      videoFile,
      thumbnailFile,
      userId,
    },
    {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  return video;
};

const getVideoById = async (videoId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new AppError("Invalid video id", 400);
  }

  const video = await videoRepository.getVideoById(videoId);
  if (!video) {
    throw new AppError("video not found ", 404);
  }

  await videoRepository.incrementViews(videoId);

  if (userId) {
    await videoRepository.addToWatchHistory(userId, videoId);
  }

  return video[0];
};

const updateVideo = async (userId, videoId, body, file) => {
  const { title, description } = body;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new AppError("invalid video id ", 400);
  }

  const video = await videoRepository.findVideoById(videoId);
  if (!video) {
    throw new AppError("Video not found", 404);
  }

  if (String(video.owner) !== String(userId)) {
    throw new AppError("unAuthorized user.", 403);
  }

  const updateData = {};
  if (title?.trim()) updateData.title = title.trim();
  if (description?.trim()) updateData.description = description.trim();

  const thumbnailFile = file?.path;

  if (thumbnailFile) {
    const uploadThumbnail = await uploadOnCloudinary(
      thumbnailFile,
      "youTube/video",
    );
    if (!uploadThumbnail?.url)
      throw new AppError("thumbnail not upload .", 500);
    updateData.thumbnail = uploadThumbnail.url;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError("No data to update", 400);
  }

  const updateVideo = await videoRepository.updateVideo(videoId, updateData);

  if (!updateVideo) {
    throw new AppError("vdieo details not update .", 500);
  }
  return updateVideo;
};

const deleteVideo = async (videoId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(videoId))
    throw new AppError("Invalid video id", 400);

  const video = await videoRepository.findVideoById(videoId);

  if (!video) {
    throw new AppError("video not found.", 404);
  }
  if (String(video.owner) !== String(userId)) {
    throw new AppError("Unauthorized user", 403);
  }

  const deleted = await videoRepository.deleteVideo(videoId);

  if (!deleted) {
    throw new AppError("Failed to delete video", 500);
  }

  return true;
};

const togglePublishStatus = async (videoId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new AppError("Invalid video id", 400);
  }

  const video = await videoRepository.findVideoById(videoId);

  if (!video) {
    throw new AppError("Video not found", 404);
  }

  if (String(video.owner) !== String(userId)) {
    throw new AppError("Unauthorized user", 403);
  }

  video.isPublished = !video.isPublished;

  await videoRepository.saveVideo(video);

  return {
    isPublished: video.isPublished,
  };
};

const getUserVideos = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user id", 400);
  }

  const videos = await videoRepository.getVideosByUserId(userId);

  return videos;
};

export default {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getUserVideos,
};
