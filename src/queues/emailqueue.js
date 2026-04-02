import { Queue } from "bullmq";
import { redisClient } from "../config/redis/redis.js";


const emailQueue = new Queue("email-queue",{
    connection:redisClient.duplicate(),

})

export default emailQueue