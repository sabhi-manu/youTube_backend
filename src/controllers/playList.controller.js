import { asyncHandler } from "../utils/asycnHandler.js"
import PlayList from "../models/playlist.model.js"
import playlistService from "../services/playlist.service.js";




export const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videoIds = [] } = req.body;
    const owner = req.user._id;

   const playList = await playlistService.createPlaylist({name,description,videoIds,owner})

    res.status(201).json({
        success: true,
        message: "Playlist created successfully",
        data: playList
    });
});

export const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const playList = await playlistService.getPlaylists(userId)



    res.status(200).json({
        success: true,
        message: "playList fetch successfully.",
        data: playList
    });
})

export const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
   
    const playList = await playlistService.getPlaylistById(playlistId)

    res.status(200).json({
        success: true,
        message: "playList fetch successfully.",
        data: playList
    });
})

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoIds } = req.body;
    const userId = req.user._id

   const updatedPlaylist = await playlistService.addVideoToPlaylistService({playlistId,videoIds,userId})

    res.status(201).json({
        success: true,
        message: "Videos added to playlist successfully.",
       
    })
})


export const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    const userId = req.user._id;

    await  playlistService.deletePlayList({playlistId,userId})

    await PlayList.deleteOne({_id:playlistId})
     res.status(200).json({
        success: true,
        message: " playlist deletd successfully.",
      
    })
})


export const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
  

           const updatedPlaylist = await playlistService.updatePlaylist({
        playlistId,
        name: req.body.name,
        description: req.body.description,
        userId: req.user._id
    });

    res.status(200).json({
        success: true,
        message: "Playlist details updated successfully",
        data: updatedPlaylist
    });

   
})