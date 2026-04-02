import sendEmail from "../../config/nodemailer/nodemailer.js"
import userRepositories from "../../repositories/user.repositories.js"


const handleFailureEmail = async (job)=>{
     const {userId,videoId, reason} = job
     const user = await userRepositories.findUserById(userId)

     await sendEmail({
        to: user.email,
        subject:"Video processing Failed",
         text: `Video ${videoId} failed: ${reason}`
     })
}

export default handleFailureEmail