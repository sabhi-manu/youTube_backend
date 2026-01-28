import mongoose from "mongoose"

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        
    },
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

const PlayList = new mongoose.model("PlayList",playlistSchema)

export default PlayList