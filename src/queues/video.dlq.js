import { Queue } from "bullmq";
import { redisClient } from "../config/redis/redis.js";


const videoDlq = new Queue("video-dlq",{
    connection:redisClient.duplicate()
} )

export default videoDlq