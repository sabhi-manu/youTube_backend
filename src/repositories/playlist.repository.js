import mongoose from "mongoose";
import PlayList from "../models/playlist.model.js";



 const createPlaylistRepo = async (data) => {
    return await PlayList.create(data);
};

const getPlayListRepo = async (userId)=>{
     return await PlayList.aggregate([
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
                     videos: 1, 
                     totalVideos: 1,
                     totalViews: 1,
                     thumbnail: 1,
                     createdAt: 1
                 }
             },
             { $sort: { createdAt: -1 } },
     
         ])
}

const getPlaylistByIdRepo = async (playlistId) => {
    return await PlayList.aggregate([
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
    ]);
};

 const addVideosToPlaylistRepo = async (playlistId, videoIds) => {
    return await PlayList.updateOne(
        { _id: playlistId },
        { $addToSet: { videos: { $each: videoIds } } }
    );
};

 const getPlaylistWithVideosRepo = async (playlistId) => {
    return await PlayList.findById(playlistId).populate({
        path: "videos",
        select: "_id title thumbnail views duration createdAt"
    });
};

const findPlaylistByIdRepo = async (playlistId) => {
    return await PlayList.findById(playlistId);
};

const updatePlaylistRepo = async (playlistId, updateData) => {
    return await PlayList.findByIdAndUpdate(
        playlistId,
        updateData,
        { new: true } 
    );
};

export default {
    createPlaylistRepo,
    getPlayListRepo,
    getPlaylistByIdRepo,
    addVideosToPlaylistRepo,
    getPlaylistWithVideosRepo,
    findPlaylistByIdRepo,
    updatePlaylistRepo
}