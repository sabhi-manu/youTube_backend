import { AppEroor } from "../utils/Apperror.js";
import { asyncHandler } from "../utils/asycnHandler.js";
import User from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js";

 export  const userRegisterController = asyncHandler(async (req,res)=>{
    console.log("data from postman==>",req.body)
    let {userName,email,fullName,password} = req.body
    if(
        [userName,email,fullName,password].some((field)=>field?.trim()=== "")
    ){
throw new AppEroor ("All details required.",400)
    }

    const userExist = await User.findOne({$or:[{email},{userName}]})
    if(userExist) throw new AppEroor("usre already exist",409)
console.log("file in controller ==>",req.files)
       const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
        console.log("file data from postman==>",avatarLocalPath," ",coverImageLocalPath)
    if(!avatarLocalPath) throw new AppEroor("avatar file is required.",400)
      const avatar = await  uploadOnCloudinary(avatarLocalPath,"youTube/profile")
      const coverImage = await  uploadOnCloudinary(coverImageLocalPath,"youTube/profile")

      if(!avatar) throw new AppEroor("avatar file is required.",400)
console.log("final image url ==>",avatar.url,coverImage.url)

      const user = await User.create({
       userName: userName.toLowerCase().trim(),
        email:email.toLowerCase().trim(),
        fullName:fullName.trim(),
        password,
        avatar:avatar.url,
        coverImage:coverImage.url|| ""
      })

     const createdUser = await User.findById(user._id).select("-password -refreshToken")
      if(!createdUser) throw new AppEroor("user not register something went wrong.",500)
        return res.status(201).json({
            success:true,
            message:"user register successfully.",
            data:createdUser
    })
})

