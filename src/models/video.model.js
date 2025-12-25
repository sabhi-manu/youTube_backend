import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new mongoose.Schema({
    videoFile:{
        type:String,  // third party
        required:true
    },
    thumbnail:{
        type:String, // third party
        requried:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    title:{
        type:String,
        requried:true
    },
    description:{
        type:String,
        requried:true
    },
    duration:{
        type:Number , // third party
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

const Video = mongoose.model("Video",videoSchema)

export default Video