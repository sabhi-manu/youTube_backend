import User from "../models/user.model.js"


const findUserById = async(userId)=>{
    return await User.findById(userId)
}

const findByEmailOrUsername = async (email, userName) => {
    return await User.findOne({
        $or: [{email},{userName}]
    })
}   

const createUser = async (userData) => {
   return await User.create({
    userName: userData.userName.toLowerCase().trim(),
    email: userData.email.toLowerCase().trim(),
    fullName: userData.fullName.trim(),
    password: userData.password,
    avatar: userData.avatar,
    coverImage: userData.coverImage
   })
}                   
   
const getUserWithoutSensitiveData = async (userId) => {
    return await User.findById(userId).select("-password -refreshToken")        
}

const removeRefreshToken = async (userId)=>{
    await User.findByIdAndUpdate(
        userId,
        { $set:{ refreshToken:""} },
        {new:true}
)
}



const getChannelProfile = async (username, currentUserId) => {

    const result = await User.aggregate([
        {
            $match: {
                userName: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribeToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribe: {
                    $cond: {
                        if: {
                            $in: [
                                currentUserId,
                                "$subscribers.subscriber"
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscribeToCount: 1,
                isSubscribe: 1
            }
        }
    ])

    return result
}

const getWatchHistory = async (userId) => {

    const result = await User.aggregate([
        {
            $match: {
                _id: userId
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
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
                                        avatar: 1,
                                        _id: 0
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        {
            $project: {
                watchHistory: 1,
                _id: 0
            }
        }
    ])

    return result
}


export default {
    findUserById,
    findByEmailOrUsername,
    createUser,
    getUserWithoutSensitiveData,
    removeRefreshToken,
    getWatchHistory,
    getChannelProfile
}