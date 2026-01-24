import express from "express"
import cookieParser from "cookie-parser"
import userRoute from "./routes/user.route.js"
import userDetail from "./routes/userDetailsChange.route.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())


app.use("/test",(req,res)=>{
    res.send("server runing successfully.")
})

app.use("/api/user",userRoute)
app.use("api/user-change",userDetail)



export default app