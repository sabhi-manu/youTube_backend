import User from "../models/user.model.js"



const updatePassword = async (user, newPassword) => {
    user.password = newPassword
    return await user.save({ validateBeforeSave: false })
}

const updateUserEmailAndFullName = async(userId,email,fullName)=>{
   return await User.findByIdAndUpdate(
        userId,
        {   $set:{ email, fullName}},
        {new:true}
    
    ).select("-password")
}

const updateUserAvatar = async (userId,avatarUrl) =>{
   return await User.findByIdAndUpdate(userId, {
                $set: { avatar: avatarUrl }
            }, { new: true }).select("-password")
}

const updateCoverImage = async (userId,coverImageUrl) =>{
   return await User.findByIdAndUpdate(userId, {
                $set: { coverImage: coverImageUrl }
            }, { new: true }).select("-password")
}

export default {
    updatePassword,
    updateUserEmailAndFullName,
    updateUserAvatar,
    updateCoverImage
}