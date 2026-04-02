import mongoose from "mongoose"
import { asyncHandler } from "../utils/asycnHandler.js"
import appError from "../utils/Apperror.js"
import Subscription from "../models/subscription.model.js";
import subscriptionService from "../services/subscription.service.js";


export const toggleSubscription = asyncHandler(async (req, res) => {
     const { channelId } = req.params;
    const userId = req.user._id;

    const result = await subscriptionService.toggleSubscription(channelId, userId);

    res.status(200).json({
        success: result.isSubscribed,
        message: result.message
    });
})

// controller to return subscriber list of a channel
export const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;
    const { page, limit } = req.query;

    const result = await subscriptionService.getChannelSubscribers(channelId, userId, page, limit);

    res.status(200).json(result);
})

// controller to return channel list to which user has subscribed
export const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
     const { page = 1, limit = 10 } = req.query;
 
     const result = await subscriptionService.getSubscribedChannels(subscriberId,page,limit)

    res.status(200).json(result);
})