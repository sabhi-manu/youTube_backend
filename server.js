import dotenv from "dotenv"
import app from "./src/app.js"
dotenv.config()

import connectDB from "./src/db/db.js"

const port = process.env.PORT||3000

async function main (){
    try {
        await  connectDB()
        app.listen(port ,()=>{
            console.log (`server runing on port http://localhost:${port}`)
        })
    } catch (error) {
        console.log("server not run",error.message)
    }
}
main()