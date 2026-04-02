import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";



 const findSubscription = (channelId, userId) => {
    return Subscription.findOne({
        channel: channelId,
        subscriber: userId
    });
};

 const createSubscription = (userId, channelId) => {
    return Subscription.create({
        subscriber: userId,
        channel: channelId
    });
};

 const deleteSubscription = (id) => {
    return Subscription.findByIdAndDelete(id);
};

 const getSubscribersAgg = (channelId, page, limit) => {
    return Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
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
    ]);
};

 const countSubscribers = (channelId) => {
    return Subscription.countDocuments({
        channel: new mongoose.Types.ObjectId(channelId)
    });
};


const getSubscribedChannelsAgg = (subscriberId, page, limit) => {
    return Subscription.aggregate([
        {
            $match: {
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
    ]);
};

const countSubscribedChannels = (subscriberId) => {
    return Subscription.countDocuments({
        subscriber: new mongoose.Types.ObjectId(subscriberId)
    });
};
     


export default {
    findSubscription,
    createSubscription,
    deleteSubscription,
    getSubscribersAgg,
    countSubscribers,
    getSubscribedChannelsAgg,
    countSubscribedChannels
}