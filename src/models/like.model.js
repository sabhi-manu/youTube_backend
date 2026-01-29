import mongoose, { mongo } from "mongoose"

const likeSchema = new mongoose.Schema({
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
   tweet:{
    type: mongoose.Schema.Types.ObjectId,
        ref:"Tweet"
   },
   likedBy:{
     type: mongoose.Schema.Types.ObjectId,
        ref:"User"
   }
},{timestamps:true})

likeSchema.index({ video: 1, likedBy: 1 }, { unique: true })

const Like = mongoose.model("Like",likeSchema)
export default Like