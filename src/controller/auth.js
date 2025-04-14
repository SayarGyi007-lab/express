import fs from "fs"
import { uploadToCloudinary } from "../utils/cloudinary.js"
import {User} from "../model/user.js"
import jwt from "jsonwebtoken"

export const register= async (req,res)=>{

    const {username,email,password} = req.body

    if([username,email,password].some((field)=>field?.trim()==="")){
        return res.status(400).json({message:"All fields are required"})
    }


    let profile_photo = ""
    let cover_photo = ""

    const profile_photo_path = req.files.profile_photo?.[0].path
    const cover_photo_path = req.files.cover_photo?.[0].path

    try {

        const existingUser = await User.findOne({
            $or : [{username}, {email}]}
        )
    
        if(existingUser){
            res.status(409).json({message:"username or email exits"})
            throw new Error("Email or username is already exists.");
            
        }

        if(profile_photo_path && cover_photo_path){
            profile_photo = await uploadToCloudinary(profile_photo_path)
            cover_photo = await uploadToCloudinary(cover_photo_path)
        }

   const user = await User.create({
    username,
        email,
        password,
        profile_photo,
        cover_photo
    })

    const createUser = await User.findById(user._id).select(
        "-password -refresh_token"
    )

    if(!createUser){
        return res.status(500).json({message:"Something wrong in registeration"})
    }

    
    return res.status(200).json({userInfo: createUser, message:"registeration success!"})


    } catch (error) {
        console.log(error)
        fs.unlinkSync(profile_photo_path)
        fs.unlinkSync(cover_photo_path)
        
    }
}

export const loginController = async(req,res)=>{
    const {username,email,password} = req.body

    if(!username || !email || !password){
        return res.status(400).json({message:"All fields are required"})
    }
        const existingUser = await User.findOne({
            $or:[{username},{email}]
        })
    
        if(!existingUser){
            return res.status(404).json({message:"No User Found"})
        }
        const validatePassword = await existingUser.isPasswordMatch(password)
    
        if(!validatePassword){
            return res.status(401).json({message:"Invalid Password"})
        }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(existingUser?._id)
    const loggedUser = await User.findById(existingUser?._id).select("-password")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV="production"
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json({user: loggedUser,message:"Login Successful"})

}

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const existingUser = await User.findById(userId)
        if(!existingUser){
            return res.status(404).json({message:"No User Found"})
        }
        const accessToken = await existingUser.generateAceesssToken()
        const refreshToken = await existingUser.generateRefreshToken()

        existingUser.refresh_token = refreshToken

        await existingUser.save({validateBeforeSave: false})
        return {accessToken,refreshToken}

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const generateNewRefreshToken = async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body
    if(!incomingRefreshToken){
        return res.status(404).json({message:"No Token Found"})
    } 

    try {
        const decodedToken =  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_KEY)
        const existingUser = await User.findById(decodedToken?._id)
        if(!existingUser){
            return res.status(404).json({message:"No User Found"})
        }

        const {accessToken,refreshToken} = generateAccessAndRefreshToken(existingUser?._id)

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV="production"
        }
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json({message:"Token Update Successful"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const logoutController = async (req,res)=>{
    if(!req.user || !req.user._id){
        return res.status(401).json({message:"Unauthorized"})
    }

    try {
        await User.findByIdAndUpdate(
            req.user._id,{
                $unset:{refresh_token:1}
            }, {new:true}
        )

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV="production"
        }

        return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json({message:"Logout Successful"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal Server Error logout"})
    }
}

export const changeUsernameController = async (req,res) =>{
    const {id} = req.params
    const {username} = req.body
    
    if(!username){
        return res.status(400).json({message:"Username is required"})
    }

    try {
        const existingUsername = await User.findOne({username})
        if(existingUsername){
            return res.status(403).json({message:"Username already exist "})
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                username
            },
            {new: true}
        ).select("username")


        return res.status(200).json({user: updatedUser, message:"Username updated successuflly"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Error at changing username"})
    }
}

export const changeEmailController = async (req,res)=>{
    const {id} = req.params
    const {email} = req.body

    if(!email){
        return res.status(400).json({message:"Email is required"})
    }
    try {
        const existingEmail = await User.findOne({email})
        if(existingEmail){
            return res.status(403).json({message:"Email already exist "})
        }
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                email
            },
            {new: true}
        ).select("username email")

        return res.status(200).json({user: updatedUser, message:"Email updated successuflly"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Error at changing email"})
    }
}

export const changePasswordController = async(req,res) =>{
    const {id} = req.params
    const {password} = req.body

    if(!password){
        return res.status(400).json({message:"Password is required"})
    }

    try {
       const existingUser = await User.findById(id)

       if(!existingUser){
        return res.status(404).json({message:"No User Found"})
       }

       existingUser.password = password
       await existingUser.save({validateBeforeSave: false})

        return res.status(200).json({user: existingUser, message:"Password updated successuflly"})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Error at changing password"})
    }
}