import mongoose from "mongoose"

const tweetSchema =new mongoose.Schema({
    owner:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required:true
    }
},{timestamps:true})

const Tweet = mongoose.model("Tweet",tweetSchema)
export default Tweet