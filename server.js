import dotenv from "dotenv"
dotenv.config()
import app from "./src/app.js"

import connectDB from "./src/db/db.js"
import { connectRedis } from "./src/config/redis/redis.js"

import videoworker from "./src/workers/video.worker.js"
import dlqWorker from "./src/workers/dlq.worker.js"
import emailWorker from "./src/workers/email.worker.js"

const port = process.env.PORT||3000

async function main (){
    try {
        await connectRedis()
        await  connectDB()
        app.listen(port ,()=>{
            console.log (`server runing on port http://localhost:${port}`)
        })
    } catch (error) {
        console.log("server not run",error.message)
    }
}
main()