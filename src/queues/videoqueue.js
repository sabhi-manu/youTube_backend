import { Queue } from "bullmq";
import { redisClient } from "../config/redis/redis.js";


const videoQueue =  new Queue("video-processing",{
    connection:redisClient
})

export default videoQueue