import User from "../models/user.model.js";
import AppError from "../utils/Apperror.js";
import uploadOnCloudinary from "../utils/cloudinary.js";


export const changeCurrentPassword = async (req, res) => {
    try {
        const userId = req.user._id
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            throw new AppError(" invalid  details", 400)
        }

        const user = await User.findById(userId)

        if (!user) {
            throw new AppError("invalid user.", 404)
        }

        const passwordCheck = await user.isPasswordCorrect(oldPassword)
        if (!passwordCheck) {
            throw new AppError("enter valid password.", 400)
        }
        user.password = newPassword
        await user.save({ validateBeforeSave: false })

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
        if (!email || !fullName) {
            throw new AppError("details not provide", 400)
        }
        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set: {
                    fullName,
                    email
                }
            },
            { new: true }).select("-password")

        res.status(200).json({
            success: true,
            message: "user update successfully.",
            user
        })
    } catch (error) {
        console.log("error in update user details.==>", error)
        throw new AppError("details not provide", 500)
    }
}

export const updateUserAvatar = async (req, res) => {
    try {
        const userId = req.user._id
        const avatarImagePath = req.file?.path
        if (!avatarImagePath) {
            throw new AppError("provide correct image.", 400)
        }

        const uploadAvatar = await uploadOnCloudinary(avatarImagePath, "youTube/profile")
        if (!uploadAvatar) {
            throw new AppError("avatar is missing ", 400)
        }

        const user = await User.findByIdAndUpdate(userId, {
            $set: { avatar: uploadAvatar?.url }
        }, { new: true }).select("-password")

        res.status(200).json({
            success: true,
            message: "user update successfully.",
            user
        })
    } catch (error) {
        console.log("error in update Avatar.==>", error)
    }
}


export const updateUserCoverImage = async (req, res) => {
    try {
        const userId = req.user
        const coverImagePath = req.file?.path
        if (!coverImagePath) {
            throw new AppError("provide correct image.", 400)
        }

        const uploadCoverImage = await uploadOnCloudinary(coverImagePath, "youTube/profile")
        if (!uploadCoverImage) {
            throw new AppError("coverImage is missing ", 400)
        }

        const user = await User.findByIdAndUpdate(userId, {
            $set: { coverImage: uploadCoverImage?.url }
        }, { new: true }).select("-password")

        res.status(200).json({
            success: true,
            message: "user update successfully.",
            user
        })
    } catch (error) {
        console.log("error in update Avatar.==>", error)
    }
}
