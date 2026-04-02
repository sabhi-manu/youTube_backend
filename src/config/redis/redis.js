import Redis from 'ioredis';


const redisClient = new Redis({
    username: process.env.REDIS_NAME,
    password: process.env.REDIS_PASSWORD,
     host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
     maxRetriesPerRequest: null
   
});

redisClient.on("connect",()=>{
    console.log("Redis client connecting...")
})

redisClient.on("error",(err)=>{
    console.log("Redis Client Error :",err)
})


redisClient.on("ready", () => {
  console.log("Redis connected successfully")
})

const connectRedis = async()=>{
   try {
     await redisClient.connect();
   } catch (error) {
    console.log("Redis connection faild : ",error.message)
   }
    
}
export {connectRedis,redisClient}
