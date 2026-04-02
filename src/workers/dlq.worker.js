import { Worker } from "bullmq";
import { redisClient } from "../config/redis/redis.js";
import emailQueue from "../queues/emailqueue.js";


console.log("dlq Worker file started...");


const dlqWorker = new Worker(
  "video-dlq",
  async (job) => {
    console.log("dlq worker  received :", job.id);
    const { userId, videoId, reason } = job.data;
    await emailQueue.add("video-failure", {
      userId,
      videoId,
      reason,
    });
  },
  {
    connection: redisClient.duplicate(),
  },
);

export default dlqWorker;
