
import { redisClient } from "../config/redis/redis.js";
import profileService from "../services/profile.service.js";
import AppError from "../utils/Apperror.js";



export const changeCurrentPassword = async (req, res) => {
    try {
        const userId = req.user._id
        const { oldPassword, newPassword } = req.body

       const result = await profileService.changeCurrentPassword(userId,oldPassword,newPassword)

        await redisClient.del(`user:profile:${userId}`);
        
        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.log("error in change password. ==>", error.message)
        throw new AppError(error.message, 500)
    }
}

export const updateAccoutDetails = async (req, res) => {
    try {
        const { email, fullName } = req.body
        console.log("check the user id and body in udate account details controller =>",req.user._id,req.body)

        const result = await profileService.updateCurrentAccountDetails(req.user._id,email,fullName)

       await redisClient.del(`user:profile:${req.user._id}`);

        res.status(200).json({
            success: true,
            message: "user update successfully.",
            user : result
        })
    } catch (error) {
        console.log("error in update user details.==>", error)
        throw new AppError("details not provide", 500)
    }
}

export const updateUserAvatar = async (req, res) => {
    try {
        const userId = req.user?._id
        const avatarImagePath = req.file?.path
      const result = await profileService.updateCurrentAvatar(userId,avatarImagePath)

      await redisClient.del(`user:profile:${userId}`);

        res.status(200).json({
            success: true,
            message: "user update successfully.",
            user: result
        })
    } catch (error) {
        console.log("error in update Avatar.==>", error)
         throw new AppError(error.message, 500)
    }
}


export const updateUserCoverImage = async (req, res) => {
    try {
        const userId = req.user?._id
        const coverImagePath = req.file?.path
      
        const result = await profileService.updateCurrentCoverImage(userId,coverImagePath)

        await redisClient.del(`user:profile:${userId}`);

        res.status(200).json({
            success: true,
            message: "user update successfully.",
            user:result
        })
    } catch (error) {
        console.log("error in update Avatar.==>", error)
         throw new AppError(error.message, 500)
    }
}
