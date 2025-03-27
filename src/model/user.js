import mongoose, { model, Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import dotenv from "dotenv"

dotenv.config()

const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
    profile_photo:{
        type: String,
    },
    cover_photo:{
        type: String,
    },
    refresh_token:{
        type: String,
    },
    posts:[{

        type: Schema.Types.ObjectId,
        ref: "post",
        
    }]
},{timestamps: true})

userSchema.pre("save", async function(next){
    
    if(!this.isModified("password")) return next()
   this.password = await bcrypt.hash(this.password,10)
   next()
})

userSchema.methods.isPasswordMatch = async function(){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generate_Aceesss_Token = async function(){
    return jwt.sign({
     _id: this._id,
     email: this.email,
     username: this.username
    },
    process.env.ACCESS_TOKEN_KEY,
    {expiresIn:process.env.ACCESS_TOKEN_KEY_EXP})
}

userSchema.methods.generate_Refresh_Token = async function(){
    return jwt.sign({
     _id: this._id,
    },
    process.env.REFRESH_TOKEN_KEY,
    {expiresIn:process.env.REFRESH_TOKEN_KEY_EXP})
}

export const User = mongoose.model("User",userSchema)