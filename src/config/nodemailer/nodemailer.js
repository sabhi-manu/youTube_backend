import nodemailer from "nodemailer"


console.log("nodemailer is running :==>", process.env.EMAIL_USER)

const transporter = nodemailer.createTransport({
  service: "Gmail", 
  auth: {
     user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({to,subject,text})=>{
  console.log("nodemailer is running :==>",process.env.EMAIL_USER,to,subject,text)
    await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to,
        subject,
        text
    })
}
export default sendEmail