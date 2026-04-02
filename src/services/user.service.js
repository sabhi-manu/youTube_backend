import mongoose from "mongoose"
import generateTokens from "../utils/generateToken.js"
import userRepositories from "../repositories/user.repositories.js"
import AppError from "../utils/Apperror.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import { redisClient } from "../config/redis/redis.js"
import emailQueue from "../queues/emailqueue.js"

const registerUser =  async ({body,files})=>{
    const {userName,email,fullName,password} = body
    if([userName,email,fullName,password].some(value=> value?.trim()==="")){
        throw new AppError("All fields are required",400)
    }

    const userExist = await userRepositories.findByEmailOrUsername(email,userName)
    if(userExist)throw new AppError("user Already exists",409)

     const avatarPath = files?.avatar?.[0]?.path;
     const coverImagePath = files?.coverImage?.[0]?.path   

     if(!avatarPath) throw new AppError("Avatar is required",400)
        const avatar = await uploadOnCloudinary(avatarPath,"/youTube/profile")
        const coverImage  = await uploadOnCloudinary(coverImagePath ,"/youTube/profile")

        const user = await userRepositories.createUser({
            userName,
            email,
            fullName,
            password,
            avatar:avatar.url,
            coverImage:coverImage?.url || ""
        })

        await emailQueue.add("welcome-email",{email:user.email,fullName:user.fullName})
        
        const { accessToken, refreshToken } = await generateTokens(user?._id)

        const createdUser = await userRepositories.getUserWithoutSensitiveData(user._id);

    if (!createdUser) throw new AppError("User registration failed", 500);

    return {
        user: createdUser,
        accessToken,
        refreshToken
    };
}

const logInUser = async (body)=>{
    const {userName,email,password} = body
  if (!(password && (email || userName))) {
    throw new AppError("Email or Username and password are required", 400)
}
    const user = await userRepositories.findByEmailOrUsername(email,userName)

    if(!user){
     throw new AppError("Invalid credentials", 401)
    }

    const isPassword = await user.isPasswordCorrect(password)
    if(!isPassword){
        throw new AppError("Invalid credentials", 401)
    }
    const {accessToken,refreshToken} = await generateTokens(user?._id)

    const loginUser = await userRepositories.getUserWithoutSensitiveData(user._id)

    if(!loginUser){
        throw new AppError("user Not found",400)
    }
    return {
        user:loginUser,
        accessToken,
        refreshToken
    }
}

const logoutUser = async (userId,accessToken)=>{
    if(!userId){
        throw new AppError("unAuthorized user",401)
    }

    const decoded = jwt.decode(accessToken)

     if (decoded?.exp) {
        const expiryTime = decoded.exp - Math.floor(Date.now() / 1000)

        if (expiryTime > 0) {
        
            await redisClient.set(
                `bl:${accessToken}`,
                "logout",
                "EX",
                expiryTime
            )
        }
    }

    await userRepositories.removeRefreshToken(userId)
    return true
}

const refreshUserToken = async (token)=>{
 if (!token) {
        throw new AppError("Unauthorized", 401)
    }

    let decoded
    try {
        decoded = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET
        )
    } catch (error) {
        throw new AppError("Invalid or expired refresh token", 401)
    }
 
    const user = await userRepositories.findUserById(decoded._id)

    if (!user) {
        throw new AppError("User not found", 404)
    }

    if (user.refreshToken !== token) {
        throw new AppError("Invalid refresh token", 401)
    }

  
    const { accessToken, refreshToken } = await generateTokens(user._id)

    return {
        accessToken,
        refreshToken
    }

}


const getUserChannelProfile = async (username, currentUserId) => {

    if (!username) {
        throw new AppError("Username is required", 400)
    }

  
    const userObjectId = currentUserId
        ? new mongoose.Types.ObjectId(currentUserId)
        : null

    const channel = await userRepositories.getChannelProfile(
        username,
        userObjectId
    )

    if (!channel || channel.length === 0) {
        throw new AppError("Channel not found", 404)
    }

    return channel[0]
}

const getUserWatchHistory = async (userId)=>{
     if (!userId) {
        throw new AppError("Unauthorized", 401)
    }
    const userObjectId = new mongoose.Types.ObjectId(userId)

   const user = await userRepositories.getWatchHistory(userObjectId)

    if (!user || user.length === 0) {
        return []
    }

    return user[0]?.watchHistory || []
}

export default {
    registerUser,
    logInUser,
    logoutUser,
    refreshUserToken,
    getUserChannelProfile,
    getUserWatchHistory
}