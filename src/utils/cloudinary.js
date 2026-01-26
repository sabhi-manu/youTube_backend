import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, folder = "youTube") => {

  try {
    console.log("local fiel image ==>", localFilePath)
    if (!localFilePath) return null
    //upload the file on cloudinary
    let response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder
    })

    console.log("file upload successfully on cloudinary ==>", response)

    fs.unlinkSync(localFilePath);
    
    return response
  } catch (error) {
    console.log("error in cloudnay ==>", error)
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
}

export default uploadOnCloudinary