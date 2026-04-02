import { asyncHandler } from "../utils/asycnHandler.js"

import dashboardService from "../services/dashboard.service.js"


export const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const currentUserId = req.user?._id;

    const result = await dashboardService.getChannelStats (channelId, currentUserId);

    res.status(200).json(result);
});

export const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const currentUserId = req.user?._id;

    const result = await dashboardService.getChannelVideos(
        channelId,
        currentUserId,
        page,
        limit
    );

    res.status(200).json(result);
});