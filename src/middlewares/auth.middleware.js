import User from "../models/user.model.js";
import { AppEroor } from "../utils/Apperror.js";
import { asyncHandler } from "../utils/asycnHandler.js";
import jwt from "jsonwebtoken"

export const authMiddlewareJWT = asyncHandler(async (req,res,next)=>{
try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    console.log('token ==>',token)
    if(!token) {
        throw new AppEroor ("Unauthorized request",403)
    }
   const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
console.log('decoded token ==>',decodedToken)
   const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
   if(!user ){
    throw new AppEroor("inavlid access token",401)
   }
   console.log('user check ==>',user)
   req.user = user;
   next()

} catch (error) {
    throw new AppEroor("Error in middleware .",400)
}
})