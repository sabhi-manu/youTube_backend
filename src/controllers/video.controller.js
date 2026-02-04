import mongoose from "mongoose"
import Video from "../models/video.model.js"
import { asyncHandler } from "../utils/asycnHandler.js";
import AppError from "../utils/Apperror.js";
import uploadOnCloudinary from "../utils/cloudinary.js";



export const getAllVideos = async (req, res) => {
    try {
        const { query, page = 1, limit = 10, userId, sortBy = "createdAt", sortType = "desc", } = req.query

        const matchCondition = { isPublished: true };
        if (query) {
            matchCondition.title = { $regex: query, $options: "i" };
        }

        if (userId) {
            matchCondition.owner = new mongoose.Types.ObjectId(userId)
        }

        const sortCondition = {
            [sortBy]: sortType === "asc" ? 1 : -1
        };

        const skip = (Number(page) - 1) * Number(limit);

        let video = await Video.aggregate([
            {
                $match: matchCondition
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                userName: 1,
                                avatar: 1
                            }
                        }
                    ]

                }
            },
            {
                $unwind: "$owner"
            },
            {
                $sort: sortCondition
            },
            { $skip: skip },
            { $limit: Number(limit) }

        ])

        const totalVideo = await Video.countDocuments(matchCondition)

        res.status(200).json({
            success: true,
            data: video,
            pagination: {
                totalVideo,
                currentPage: Number(page),
                totalPages: Math.ceil(totalVideo / limit)
            }
        });

    } catch (error) {
        console.log("error in fetching all video controller. ==>", error)
    }
}

export const publishAVideo = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { title, description } = req.body

    if (!title?.trim() || !description?.trim()) {
        throw new AppError("Provide all details", 400);
    }

    const videoFile = req.files?.video?.[0]?.path
    const thumbnailFile = req.files?.thumbnail?.[0]?.path

    if (!videoFile) {
        throw new AppError("video file required.", 400)
    }

    if (!thumbnailFile) {
        throw new AppError("thumbnail file  required .", 400)
    }

    const videoUpload = await uploadOnCloudinary(videoFile, "youTube/videos/video")
    const thumbnailUpload = await uploadOnCloudinary(thumbnailFile, "youTube/videos/thumbnail")

    if (!videoUpload?.url) {
        throw new AppError("Video upload failed", 400);
    }

    if (!thumbnailUpload?.url) {
        throw new AppError("Thumbnail upload failed", 400);
    }


    const video = await Video.create({
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        owner: userId,
        title,
        description,
        duration: videoUpload.duration
    })

    const createVideo = await Video.findById(video._id)
    if (!createVideo) throw new AppError("video not published.", 500)
    res.status(201).json({
        success: true,
        message: 'video published successfully.',
        data: createVideo
    })
})

export const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new AppError("Invalid video id", 400);
    }


    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
                isPublished: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            userName: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$user"
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLikedByCurrentUser: userId
                    ? {
                        $in: [
                            new mongoose.Types.ObjectId(userId),
                            "$likes.likedBy"
                        ]
                    }
                    : false
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ])

    if (!video.length) {
        throw new AppError("Video not found", 404);
    }

    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    })

    res.status(200).json({
        success: true,
        message: 'video published successfully.',
        data: video[0]
    })
})


export const updateVideo = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { videoId } = req.params
    const { title, description } = req.body

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new AppError("invalid video id ", 400)
    }

    const isVideo = await Video.findById(videoId)
    if (!isVideo) throw new AppError("video not found .", 404)

    if (String(isVideo.owner) !== String(userId)) throw new AppError("unAuthorized user .", 403)
    //    if (!video.owner.equals(userId)) {
    //     throw new AppError("Unauthorized user", 403);
    //   }

    const updateData = {};

    if (title?.trim()) updateData.title = title;
    if (description?.trim()) updateData.description = description;

    const thumbnailFile = req.file?.path
    if (thumbnailFile) {
        const uploadThumbnail = await uploadOnCloudinary(thumbnailFile, "youTube/video")
        if (!uploadThumbnail?.url) throw new AppError("thumbnail not upload .", 500)
        updateData.thumbnail = uploadThumbnail.url
    }

    const updateVideo = await Video.findByIdAndUpdate(videoId, {
        $set: updateData
    }, { new: true })
    if (!updateVideo) {
        throw new AppError("video details not update.", 500)
    }
    res.status(200).json({
        success: true,
        message: "video details update successfully.",
        data: updateVideo
    })

})

export const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) throw new AppError("Invalid video id", 400);

    const isVideo = await Video.findById(videoId)
    if (!isVideo) {
        throw new AppError("Video not found", 404);
    }

    if (!isVideo.owner.equals(userId)) {
        throw new AppError("Unauthorized user", 403);
    }

    await Video.findByIdAndDelete(videoId);

    res.status(200).json({
        success: true,
        message: "Video deleted successfully"
    });
})

export const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new AppError("invalid video id .", 400)
    }
    const isVideo = await Video.findById(videoId)
    if (!isVideo) throw new AppError("video not found", 404)

    if (!isVideo.owner.equals(userId)) {
        throw new AppError("UnAuthorized user .", 403)
    }

    isVideo.isPublished = !isVideo.isPublished;
    await isVideo.save()

    return res.status(200).json({
        success: true,
        message: isVideo.isPublished
            ? "Video published successfully."
            : "Video unpublished successfully.",
        data: {
            isPublished: isVideo.isPublished
        }
    })
})