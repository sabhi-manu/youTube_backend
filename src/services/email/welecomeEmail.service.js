import sendEmail from "../../config/nodemailer/nodemailer.js"
import userRepositories from "../../repositories/user.repositories.js"



const handleWelcomeEmail  = async (job)=>{
    const {email,fullName}= job
   
    // const user = await userRepositories.findUserById(userId)
    await sendEmail({
        to:email,
        subject: `Welcome ${fullName}`,
       text: "We're excited to have you on board!  Your account has been successfully created. "
    })
}

export default handleWelcomeEmail