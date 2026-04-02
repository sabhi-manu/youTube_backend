import mongoose from "mongoose";
import playlistRepository from "../repositories/playlist.repository.js";
import AppError from "../utils/Apperror.js";





const createPlaylist = async({ name, description, videoIds, owner })=>{
    if (!name || !name.trim()) {
        throw new AppError("Playlist name is required", 400);
    }

    if (!Array.isArray(videoIds)) {
        throw new AppError("videoIds must be an array", 400);
    }

    if (!videoIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
        throw new AppError("One or more video IDs are invalid", 400);
    }

    const playList = await playlistRepository.createPlaylistRepo({
        name: name.trim(),
        description: description?.trim() || "",
        owner,
        videos: videoIds
    });

    return playList;

}


const getPlaylists = async (userId)=>{
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new AppError("channel id not valid.",400)
    }

    const playlist = await playlistRepository.getPlayListRepo(userId)

    return playlist
}

 const getPlaylistById  = async (playlistId) => {

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new AppError("playlistId not valid.", 400);
    }

    const playList = await playlistRepository.getPlaylistByIdRepo(playlistId);

    if (!playList.length) {
        throw new AppError("Playlist not found.", 404);
    }

    return playList[0];
};

 const addVideoToPlaylistService = async ({ playlistId, videoIds, userId }) => {

   
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new AppError("channel id not valid.", 400);
    }

    
    if (!Array.isArray(videoIds) || !videoIds.length) {
        throw new AppError("No videos provided.", 400);
    }

    if (!videoIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
        throw new AppError("One or more video IDs are invalid", 400);
    }

  
    const playList = await playlistRepository.findPlaylistByIdRepo(playlistId);

    if (!playList) {
        throw new AppError("Playlist not found.", 404);
    }

    
    if (playList.owner.toString() !== userId.toString()) {
        throw new AppError("UnAuthorized to add videos.", 403);
    }

    
    await playlistRepository.addVideosToPlaylistRepo(playlistId, videoIds);

 
    const updatedPlaylist = await playlistRepository.getPlaylistWithVideosRepo(playlistId);

    return updatedPlaylist;
}; 

const deletePlayList = async ({playlistId,userId})=>{
    
      if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new AppError("channel id not valid.", 400)
    }

    const playList = await playlistRepository.findPlaylistByIdRepo(playlistId)
      if (!playList) {
        throw new AppError("Playlist not found.", 404);
    }

      if (playList.owner.toString() !== userId.toString()) {
        throw new AppError("UnAuthorized to delete videos. ", 403)
    }

    return true
}

const updatePlaylist = async ({playlistId,name,description,userId})=>{

        if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            throw new AppError("channel id not valid.", 400)
        }
    
         if (!name || !name.trim()) {
            throw new AppError("Playlist name is required.", 400);
        }
    
          const playlist = await playlistRepository.findPlaylistByIdRepo(playlistId);
        if (!playlist) {
            throw new AppError("Playlist not found.", 404);
        }
    
          if (playlist.owner.toString() !== userId.toString()) {
            throw new AppError("Unauthorized to update this playlist. ", 403)
        }
    
        const updatedPlaylist = await playlistRepository.updatePlaylistRepo(playlistId, {
        name: name.trim(),
        description: description?.trim() || ""
    });

    return updatedPlaylist;
}

export default {
    createPlaylist,
    getPlaylists,
    getPlaylistById,
    addVideoToPlaylistService,
    deletePlayList,
    updatePlaylist
  
}