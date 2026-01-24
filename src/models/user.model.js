import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true,
         lowercase:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
       

    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
       
    },
    password:{
        type:String,
        required:true,
        
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    avatar:{
        type:String  // third party
    },
    coverImage:{
        type:String  // third party
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})


// hashing a password

userSchema.pre("save", async function(req,res,next){
try {
        if (!this.isModified("password")) return 
    let hashPassword = await bcrypt.hash(this.password, 10)
this.password = hashPassword
next()
} catch (error) {
    console.log("error in hash password.==>",error.message)
    next(error)
}
})


// method for compare password

userSchema.methods.isPasswordCorrect = async function (password) {
    
    return await bcrypt.compare(password,this.password)
    
}

// TOKEN GENERATE
userSchema.methods.generateAccessToken = function (){
    console.log('access token is create ==>')
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}
userSchema.methods.generateRefreshToken = function (){
    console.log('refresh token call for createing==>')
     return jwt.sign(
        {
            _id:this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}

const User = mongoose.model("User",userSchema)

export default User
