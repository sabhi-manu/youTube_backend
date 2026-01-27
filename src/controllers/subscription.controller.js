import mongoose from "mongoose"
import { asyncHandler } from "../utils/asycnHandler.js"
import appError from "../utils/Apperror.js"
import Subscription from "../models/subscription.model.js";


export const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new appError("channel id is invalid.", 400)
    }

    if (channelId.toString() == userId.toString()) {
        throw new appError("You cannot subscribe to your own channel.", 400)
    }

    const channelUser = await Subscription.findById(channelId)
    if (!channelUser) {
        throw new appError("channel not exist.", 400)
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: userId
    })

    let isSubscribed

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id)
        isSubscribed = false
    } else {
        await Subscription.create({
            subscriber: userId,
            channel: channelId
        })
        isSubscribed = true
    }

    res.status(200).json({
        success: isSubscribed,
        message: isSubscribed ? "Subscribed successfully." : "Unsubscribed successfully."
    })
})

// controller to return subscriber list of a channel
export const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new appError("invalid channel id.", 400)
    }

    if (channelId.toString() !== userId.toString()) {
        throw new appError("UnAuthorized user.", 403)
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "user",
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
        { $unwind: "$user" },

        { $sort: { createdAt: -1 } },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) }
    ])

    const totalSubscriber = await Subscription.countDocuments( {channel: new mongoose.Types.ObjectId(channelId)})
    res.status(200).json({
        success: true,
        message: "fetch successfully.",
        data: subscribers,
        pagination: {
            totalSubscriber,
            currentPage: Number(page),
            totalPages: Math.ceil(totalSubscriber / limit)
        }
    })
})

// controller to return channel list to which user has subscribed
export const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if(!mongoose.Types.ObjectId.isValid(subscriberId) ){
        throw new appError("invalid subscriberId .",400)
    }

    const subscriberList = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "user",
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
         { $unwind: "$user" },

        { $sort: { createdAt: -1 } },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) }
    ])

     const totalSubscriber = await Subscription.countDocuments( {subscriber: new mongoose.Types.ObjectId(subscriberId)})
    res.status(200).json({
        success: true,
        message: "fetch successfully.",
        data: subscribers,
        pagination: {
            totalSubscriber,
            currentPage: Number(page),
            totalPages: Math.ceil(totalSubscriber / limit)
        }
    })
})