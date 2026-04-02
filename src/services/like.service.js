import mongoose from "mongoose";
import videoRepository from "../repositories/video.repository.js";
import tweetRepository from "../repositories/tweet.repository.js";
import likeRepository from "../repositories/like.repository.js";



const toggleLike = async (type, entityId, userId) => {
    console.log("toggleLike called with type:", type, "entityId:", entityId, "userId:", userId);

    if (!mongoose.Types.ObjectId.isValid(entityId)) {
        throw new AppError(`invalid ${type} id.`, 400);
    }

    let entity;
    if (type === "video") {
        entity = await videoRepository.findVideoById(entityId);
    } else if (type === "tweet") {
        entity = await tweetRepository.getTweetById(entityId);
    }

    if (!entity) {
        throw new AppError(`${type} not found.`, 404);
    }

    const query = { likedBy: userId, [type]: entityId };

    const existing = await likeRepository.findLike(query);

     
    if (existing) {
        await likeRepository.deleteLike(existing._id);

        return {
            success: true,
            liked: false,
            message: `${type} unliked successfully.`
        };
    }

   
    await likeRepository.createLike(query);

    return {
        success: true,
        liked: true,
        message: `${type} liked successfully.`
    };
};

const getLikedVideos = async (userId, page = 1, limit = 10) => {

    const likedVideos = await likeRepository.getLikedVideosAgg(userId, page, limit);
    const totalLikedVideos = await likeRepository.countLikedVideos(userId);

    return {
        success: true,
        message: "Liked videos fetched successfully.",
        data: likedVideos,
        pagination: {
            totalLikedVideos,
            currentPage: Number(page),
            totalPages: Math.ceil(totalLikedVideos / limit)
        }
    };
};


export default {
    toggleLike,
    getLikedVideos,
    
}