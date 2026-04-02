import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        default: "" 
    },
    thumbnail: {
        type: String,
        default: "" 
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    title: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number
    },
    views: {
        type: Number,
        default: 0,
        index: true
    },
    isPublished: {
        type: Boolean,
        default: false, 
        index: true
    },

   
    status: {
        type: String,
        enum: ["processing", "published", "failed"],
        default: "processing",
        index: true
    }

}, { timestamps: true });


videoSchema.plugin(mongooseAggregatePaginate);


videoSchema.index({ owner: 1, isPublished: 1 });
videoSchema.index({ title: "text", description: "text" });



const Video = mongoose.model("Video", videoSchema)
export default Video