import express from "express"
import cookieParser from "cookie-parser"
import userRoute from "./routes/user.route.js"
import userDetail from "./routes/userDetailsChange.route.js"
import videoRoute from "./routes/video.route.js"
import subscriptionRoute from "./routes/subscription.route.js"
import tweetRoute from "./routes/tweet.route.js"
import commentRoute from "./routes/comment.route.js"
import playListRoute from './routes/playList.route.js'
import likeRoute from "./routes/like.route.js"
import dashBoardRoute from "./routes/dashboard.route.js"
import errorHandler from "./middlewares/errorHandler.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())


app.use("/test",(req,res)=>{
    res.send("server runing successfully.")
})

app.use("/api/user",userRoute)
app.use("/api/user/details",userDetail)
app.use("/api/videos",videoRoute)
app.use("/api/subscriptions",subscriptionRoute)
app.use("/api/tweet",tweetRoute)
app.use("/api/comment",commentRoute)
app.use('/api/playlist',playListRoute)
app.use("/api/likes",likeRoute)
app.use("/api/dashboard",dashBoardRoute)

app.use(errorHandler)
export default app