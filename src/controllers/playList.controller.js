import { asyncHandler } from "../utils/asycnHandler"
import AppError from "../utils/Apperror"
import PlayList from "../models/playlist.model"
import mongoose from "mongoose";

export const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const owner = req.user._id;
    if (!name || !name.trim()) {
        throw new AppError("Playlist name is required", 400);
    }

    const playList = await PlayList.create({
        name: name.trim(),
        description: description?.trim() || "",
        owner,
        videos: []
    })
    res.status(201).json({
        success: true,
        message: "PlayList create successfully.",
        playList
    })
})


export const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError("channel id not valid.", 400)
    }

    const playList = await PlayList.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            }
        },
        {
            $addFields: {
                totalVideos: { $size: "$videos" },
                totalViews: { $sum: "$videos.views" },
                thumbnail: { $arrayElemAt: ["$videos.thumbnail", 0] }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                thumbnail: 1,
                createdAt: 1
            }
        },
        { $sort: { createdAt: -1 } },

    ])
    res.status(200).json({
        success: true,
        message: "playList fetch successfully.",
        data: playList
    });
})

export const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new AppError("playlistId id not valid.", 400)
    }

    const playList = await PlayList.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(playlistId) }
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
            $addFields: {
                owner: { $arrayElemAt: ["$owner", 0] }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",

            }
        },
        {
            $addFields: {
                totalVideos: { $size: "$videos" },
                totalViews: { $sum: "$videos.views" },
                thumbnail: { $arrayElemAt: ["$videos.thumbnail", 0] }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                owner: 1,
                totalVideos: 1,
                totalViews: 1,
                thumbnail: 1,
                videos: {
                    _id: 1,
                    title: 1,
                    thumbnail: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1
                },
                createdAt: 1
            }
        }
    ])

    res.status(200).json({
        success: true,
        message: "playList fetch successfully.",
        data: playList[0]
    });
})

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoIds } = req.body;
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new AppError("channel id not valid.", 400)
    }

       if (!Array.isArray(videoIds) || !videoIds.length) {
        throw new AppError("No videos provided.", 400);
    }

    if (!videoIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
    throw new AppError("One or more video IDs are invalid", 400);
}

    const playList = await PlayList.findById(playlistId)
     if (!playList) {
        throw new AppError("Playlist not found.", 404);
    }

    if (playList.owner.toString() !== userId.toString()) {
        throw new AppError("UnAuthorized to add videos. ", 403)
    }

    await PlayList.updateOne(
        { _id: playlistId },
        { $addToSet: { videos: { $each: videoIds } } }
    )

     const updatedPlaylist = await PlayList.findById(playlistId).populate({
        path: "videos",
        select: "_id title thumbnail views duration createdAt"
    });

    res.status(201).json({
        success: true,
        message: "Videos added to playlist successfully.",
        data: updatedPlaylist
    })
})


export const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new AppError("channel id not valid.", 400)
    }

    const playList = await PlayList.findById(playlistId)
      if (!playList) {
        throw new AppError("Playlist not found.", 404);
    }

      if (playList.owner.toString() !== userId.toString()) {
        throw new AppError("UnAuthorized to delete videos. ", 403)
    }

    await PlayList.deleteOne({_id:playlistId})
     res.status(200).json({
        success: true,
        message: " playlist deletd successfully.",
      
    })
})


export const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    const userId = req.user._id;

          if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new AppError("channel id not valid.", 400)
    }

     if (!name || !name.trim()) {
        throw new AppError("Playlist name is required.", 400);
    }

      const playlist = await PlayList.findById(playlistId);
    if (!playlist) {
        throw new AppError("Playlist not found.", 404);
    }

      if (playlist.owner.toString() !== userId.toString()) {
        throw new AppError("Unauthorized to update this playlist. ", 403)
    }

    playlist.name= name.trim();
    playlist.description = description.trim() || ""
    await playlist.save()

     res.status(200).json({
        success: true,
        message: "Playlist details updated successfully",
      
    })
})