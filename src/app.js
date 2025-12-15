import express from "express"

const app = express()
app.use("/test",(req,res)=>{
    res.send("server runing successfully.")
})

export default app