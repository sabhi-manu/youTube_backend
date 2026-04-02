import { asyncHandler } from "../utils/asycnHandler.js";
import userService from "../services/user.service.js";
import { redisClient } from "../config/redis/redis.js";


export const userRegisterController = asyncHandler(async (req, res) => {
    console.log("checking data coming in controller : register =>",req.body,req.files)
    const result = await userService.registerUser({
        body: req.body,
        files: req.files
    });

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    };

    res.cookie("accessToken", result.accessToken, options);
    res.cookie("refreshToken", result.refreshToken, options);

    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result.user
    });
});

export const userLoginController = asyncHandler(async (req, res) => {

  const result = await userService.logInUser(req.body)

   
    const option = {
        httpOnly: true,
        secure: true,
          sameSite: "none", 
    }

    res.cookie("accessToken", result.accessToken, option)
    res.cookie("refreshToken", result.refreshToken, option)
    console.log("login user details. ==>", result.user)
    res.status(200).json({
        success: true,
        message: "user Login successfully.",
        data: result.user
    })


})

export const userLogoutController = asyncHandler(async (req, res) => {

    const accessToken = req.cookies?.accessToken || 
        req.header("Authorization")?.replace("Bearer ", "")


    const result = await userService.logoutUser(req.user._id,accessToken)

    const option = {
        httpOnly: true,
        secure: true,
          sameSite: "none", 
    }
    res.clearCookie("accessToken", option)
    res.clearCookie("refreshToken", option)
    res.status(200).json({
        success: true,
        message: "user logout successfull."
    })
})


export const refreshTOkenController = asyncHandler(async (req, res) => {
    const incomingRefresToken = req.cookies.refreshToken
   const result = await userService.refreshUserToken(incomingRefresToken)

    const option = {
         httpOnly: true,
        secure: true,
        sameSite: "none"
    }
    res.cookie("accessToken", result.accessToken, option)
    res.cookie("refreshToken", result.refreshToken, option)
   

    res.status(200).json({
        success: true,
        message: "token reset successfully."
    })
})

export const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "current user fetch successfully.",
        data: req.user
    })
})

export const getUserChannelProfile = async (req, res) => {
    
     const { username } = req.params
     const userId = req.user._id
        
      const cacheKey = `user:profile:${userId}`;

       const cachedData = await redisClient.get(cacheKey);

       if (cachedData) {
        console.log(" Cache HIT , user profile ==>");
        return res.status(200).json(JSON.parse(cachedData));
    }

    const data = await userService.getUserChannelProfile(
        username,
        req.user?._id
    )

    await redisClient.set(cacheKey, JSON.stringify(data), "EX", 3600);

console.log("cache miss , user profile ==>")
        res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data
    })
    
}

export const getWatchHistoryController = asyncHandler(async (req, res) => {

    const data = await userService.getUserWatchHistory(req.user?._id)

    res.status(200).json({
        success: true,
        message: "History fetched successfully",
        data
    })
})