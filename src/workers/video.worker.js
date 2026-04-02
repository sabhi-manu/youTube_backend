import { Worker } from "bullmq";
import { redisClient } from "../config/redis/redis.js";
import videoRepository from "../repositories/video.repository.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import AppError from "../utils/Apperror.js";
import videoDlq from "../queues/video.dlq.js";

console.log("video Worker file started...");

const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    console.log("video Worker running...");
    console.log("Processing job:", job.name);

    const { videoFile, thumbnailFile, videoId,userId } = job.data;

    console.log("vidoe worker => videoPath:", videoFile);
    console.log("vidoe worker => thumbnailPath:", thumbnailFile);
try {
    
        const videoUpload = await uploadOnCloudinary(
          videoFile,
          "youTube/videos/video",
        );
    
        const thumbnailUpload = await uploadOnCloudinary(
          thumbnailFile,
          "youTube/videos/thumbnail",
        );
    
        if (!videoUpload?.url) {
          throw new AppError("Video upload failed", 400);
        }
    
        if (!thumbnailUpload?.url) {
          throw new AppError("Thumbnail upload failed", 400);
        }
    
        await videoRepository.updateVideo(videoId, {
          videoFile: videoUpload.url,
          thumbnail: thumbnailUpload.url,
          status: "published",
          isPublished: true,
        })
} catch (error) {
     console.log(" Worker error:", error.message);

      await videoRepository.updateVideo(videoId, {
        status: "failed"
      });

      throw error;
}
  },
  {
    connection: redisClient.duplicate(),
  },
);

// events
videoWorker.on("completed", (job) => {
  console.log(" job completed:", job.id);
});

videoWorker.on("failed", async (job, err) => {
  if(job.attemptsMade == job.opts.attempts){
    console.log("pass to dlq.==>",job.id)
    await videoDlq.add("faild-video",{
      userId: job.data.userId,
      videoId: job.data.videoId,
      reason: err.message
    })

  }
  
});

export default videoWorker;
