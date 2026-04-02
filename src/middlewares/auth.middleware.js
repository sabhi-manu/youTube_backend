import { redisClient } from "../config/redis/redis.js";
import User from "../models/user.model.js";
import AppError from "../utils/Apperror.js";
import { asyncHandler } from "../utils/asycnHandler.js";
import jwt from "jsonwebtoken"

export const authMiddlewareJWT = asyncHandler(async (req,res,next)=>{
try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    console.log('token ==>',token)
    if(!token) {
        throw new AppError ("Unauthorized request",403)
    }

     const isBlacklisted = await redisClient.get(`bl:${token}`)

    if (isBlacklisted) {
        throw new AppError("Token expired. Please login again.", 401)
    }
    
   const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
console.log('decoded token ==>',decodedToken)
   const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
   if(!user ){
    throw new AppError("inavlid access token",401)
   }
   console.log('user check ==>',user)
   req.user = user;
   next()

} catch (error) {
    throw new AppError("Error in middleware .",400)
}
})