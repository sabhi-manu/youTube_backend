import mongoose from "mongoose";
import subscriptionRepository from "../repositories/subscription.repository.js";




 const toggleSubscription  = async (channelId, userId) => {

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new appError("channel id is invalid.", 400);
    }

    if (channelId.toString() === userId.toString()) {
        throw new appError("You cannot subscribe to your own channel.", 400);
    }

    const existing = await subscriptionRepository.findSubscription(channelId, userId);

    if (existing) {
        await subscriptionRepository.deleteSubscription(existing._id);
        return {
            isSubscribed: false,
            message: "Unsubscribed successfully."
        };
    }

    await subscriptionRepository.createSubscription(userId, channelId);

    return {
        isSubscribed: true,
        message: "Subscribed successfully."
    };
};

 const getChannelSubscribers = async (channelId, userId, page = 1, limit = 10) => {

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new appError("invalid channel id.", 400);
    }

    if (channelId.toString() !== userId.toString()) {
        throw new appError("UnAuthorized user.", 403);
    }

    const subscribers = await subscriptionRepository.getSubscribersAgg(channelId, page, limit);

    const total = await subscriptionRepository.countSubscribers(channelId);

    return {
        success: true,
        message: "fetch successfully.",
        data: subscribers,
        pagination: {
            totalSubscriber: total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit)
        }
    };
};


const getSubscribedChannels = async (subscriberId, page = 1, limit = 10) => {

    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new appError("invalid subscriberId.", 400);
    }

    const subscribedChannels =
        await subscriptionRepository.getSubscribedChannelsAgg(subscriberId, page, limit);

    const totalSubscriber =
        await subscriptionRepository.countSubscribedChannels(subscriberId);

    return {
        success: true,
        message: "fetch successfully.",
        data: subscribedChannels,
        pagination: {
            totalSubscriber,
            currentPage: Number(page),
            totalPages: Math.ceil(totalSubscriber / limit)
        }
    };
};

export default {
    toggleSubscription,
    getChannelSubscribers,
    getSubscribedChannels
}

