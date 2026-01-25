import { AppEroor } from "../utils/Apperror.js";
import { asyncHandler } from "../utils/asycnHandler.js";
import User from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import Subscription from "../models/subscription.model.js";


async function generateTokens(userId) {
    console.log('check the user id ==>', userId)
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        console.log('check token ==>', accessToken, ' ', refreshToken)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        console.log('user check ==>', user)

        return { accessToken, refreshToken }
    } catch (error) {
        throw new AppEroor("Error in Token creation.", 400)
    }


}


export const userRegisterController = asyncHandler(async (req, res) => {
    console.log("data from postman==>", req.body)
    let { userName, email, fullName, password } = req.body
    if (
        [userName, email, fullName, password].some((field) => field?.trim() === "")
    ) {
        throw new AppEroor("All details required.", 400)
    }

    const userExist = await User.findOne({ $or: [{ email }, { userName }] })
    if (userExist) throw new AppEroor("usre already exist", 409)
    console.log("file in controller ==>", req.files)
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    console.log("file data from postman==>", avatarLocalPath, " ", coverImageLocalPath)
    if (!avatarLocalPath) throw new AppEroor("avatar file is required.", 400)
    const avatar = await uploadOnCloudinary(avatarLocalPath, "youTube/profile")
    const coverImage = await uploadOnCloudinary(coverImageLocalPath, "youTube/profile")

    if (!avatar) throw new AppEroor("avatar file is required.", 400)
    console.log("final image url ==>", avatar.url, coverImage.url)

    const user = await User.create({
        userName: userName.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        password,
        avatar: avatar.url,
        coverImage: coverImage.url || ""
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) throw new AppEroor("user not register something went wrong.", 500)
    return res.status(201).json({
        success: true,
        message: "user register successfully.",
        data: createdUser
    })
})


export const userLoginController = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body
    if (!(email || userName)) {
        throw new AppEroor("userName or email is required", 400)
    }
    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (!user) {
        throw new AppEroor("user Not present . check your details.", 400)
    }

    const isPassword = await user.isPasswordCorrect(password)
    if (!isPassword) {
        throw new AppEroor("user Not present . check your details.", 400)
    }

    const { accessToken, refreshToken } = await generateTokens(user?._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    res.cookie("accessToken", accessToken, option)
    res.cookie("refreshToken", refreshToken, option)
    res.status(200).json({
        success: true,
        message: "user Login successfully.",
        data: loggedInUser
    })


})

export const userLogoutController = asyncHandler(async (req, res) => {
    console.log('user logout controller ==>')
    await User.findByIdAndDelete(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const option = {
        httpOnly: true,
        secure: true
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
    if (!incomingRefresToken) {
        throw new AppEroor("user Not present . check your details.", 400)
    }

    let id = incomingRefresToken?._id
    const { accessToken, refreshToken } = await generateTokens(id)

    const option = {
        httpOnly: true,
        secure: true
    }

    res.cookie("accessToken", accessToken, option)
    res.cookie("refreshToken", refreshToken, option)

    res.status(200).json({
        success: true,
        message: "token reset successfully."
    })
})

export const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "current user fetch successfully.",
        user: req.user
    })
})

export const getUserChannelProfile = async (req,res)=>{
    try {
      const {username} = req.params
      if(!username){
        throw new AppEroor("user name is missing.",400)
      }
    let channel = await  User.aggregate([
        {
            $match:{ userName:username?.toLowerCase() }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                subscribeToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribe:{
                    $cond:{
                        if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                userName:1,
                subscribersCount:1,
                subscribeToCount:1,
                isSubscribe:1,
                email:1,
                avatar:1,
                coverImage:1,
                _id:0

            }
        }
      ])

      console.log("check the channel aggregate value ===>",channel)

      if(!channel?.length){
        throw new AppEroor("channel not exist",400)
      }
      return res.status(200).json({
        success:true,
        message:"data fetch successfully.",
        data:channel[0]
      })
    } catch (error) {
        console.log("error in getting user channle profile.==>",error)
    }
}