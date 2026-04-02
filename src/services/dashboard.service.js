import mongoose from "mongoose";
import dashboardRepository from "../repositories/dashboard.repository.js";
import userRepositories from "../repositories/user.repositories.js";





const getChannelStats = async (channelId, currentUserId) => {

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new AppError("Invalid channel id.", 400);
    }

    if (channelId.toString() !== currentUserId.toString()) {
        throw new AppError("UnAuthorized.", 403);
    }

    const videoStats = await dashboardRepository.getChannelStatsAgg(channelId);
    const totalSubscribers = await dashboardRepository.countSubscribers(channelId);

    const stats = {
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: videoStats[0]?.totalLikes || 0,
        totalSubscribers
    };

    return {
        success: true,
        data: stats
    };
};

const getChannelVideos = async (
    channelId,
    currentUserId,
    page = 1,
    limit = 10
) => {

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new AppError("Invalid channel id.", 400);
    }

    const channel = await userRepositories.findUserById(channelId);
    if (!channel) {
        throw new AppError("Channel not found.", 404);
    }

    const isOwner =
        currentUserId && currentUserId.toString() === channelId.toString();

    const videos = await dashboardRepository.getChannelStatsAgg(channelId, isOwner, page, limit);
    const totalVideos = await dashboardRepository.countChannelVideos(channelId, isOwner);

    return {
        success: true,
        data: videos,
        pagination: {
            totalVideos,
            currentPage: Number(page),
            totalPages: Math.ceil(totalVideos / limit)
        }
    };
};

export default {
    getChannelStats,
    getChannelVideos
}