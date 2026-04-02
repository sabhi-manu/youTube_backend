import { Worker } from "bullmq";
import { redisClient } from "../config/redis/redis.js";
import handleFailureEmail from "../services/email/videoFailureEmail.service.js";
import handleWelcomeEmail from "../services/email/welecomeEmail.service.js";

console.log("email Worker file started...");

const emailWorker = new Worker("email-queue", async(job)=>{
    console.log("job in email queue",job.name)

    switch (job.name) {
        case "video-failure":
            return handleFailureEmail(job.data)
            
        case "welcome-email":
            return handleWelcomeEmail(job.data)
            
        default:
             console.log("Unknown email job:", job.name);
            break;
    } 
    
},
{
    connection:redisClient
}
)


emailWorker.on("completed",(job)=>{
    console.log("Job complete==>",job.id)
})

emailWorker.on("failed",(job,error)=>{
    console.log("job fail to execute ",job.id , "error:",error.message)

})


export default emailWorker