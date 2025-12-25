import express from "express"
import { userRegisterController } from "../controllers/user.controller.js"
import upload from "../middlewares/multer.middleware.js"


const route = express.Router()

route.post("/register", upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:"1"
    }
]) ,userRegisterController)






export default route