import profileRepositorie from "../repositories/profile.repositorie.js"
import userRepositories from "../repositories/user.repositories.js"
import AppError from "../utils/Apperror.js"
import uploadOnCloudinary from "../utils/cloudinary.js"


const changeCurrentPassword = async (userId,oldPassword,newPassword)=>{

      if (!oldPassword || !newPassword) {
        throw new AppError("Invalid details", 400)
    }

    const user = await userRepositories.findUserById(userId)
    if(!user){
        throw new AppError("User not found", 404)
    }

    const isMatch = await user.isPasswordCorrect(oldPassword)

    if (!isMatch) {
        throw new AppError("Incorrect old password", 400)
    }

    await profileRepositorie.updatePassword(user,newPassword)

    return true
}


const updateCurrentAccountDetails = async (userId,email,fullName)=>{
    if(!email || ! fullName || !userId){
        throw new AppError ("Details not Provide",400)
    }
console.log("user id and details in service file ==>",userId,email,fullName)
    const update = await profileRepositorie.updateUserEmailAndFullName(userId,email,fullName)

    return update
}

const updateCurrentAvatar = async (userId,avatarImagePath)=>{
    if(!avatarImagePath){
        throw new AppError("provide correct image url.",400)
    }
    const uploadAvatar = await uploadOnCloudinary(avatarImagePath,"youTube/profile")

    if (!uploadAvatar?.url) {
    throw new AppError("Image upload failed", 400)
}
    const updateAvatar = await profileRepositorie.updateUserAvatar(userId,uploadAvatar.url)

    return updateAvatar

}

const updateCurrentCoverImage = async (userId,coverImagePath)=>{
    if(!coverImagePath){
        throw new AppError("provide correct image url.",400)
    }
    const uploadCoverImage = await uploadOnCloudinary(coverImagePath,"youTube/profile")

 if (!uploadCoverImage?.url) {
    throw new AppError("Image upload failed", 400)
}
    const updateAvatar = await profileRepositorie.updateCoverImage(userId,uploadCoverImage.url)

    return updateAvatar

}



export default {
    changeCurrentPassword,
    updateCurrentAccountDetails,
    updateCurrentAvatar,
    updateCurrentCoverImage
}