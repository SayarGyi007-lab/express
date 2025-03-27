import fs from "fs"
import { uploadToCloudinary } from "../utils/cloudinary.js"
import {User} from "../model/User.js"

export const register= async (req,res)=>{
    console.log(req.files)



    const{username,email,password} = req.body

    if([username,email,password].some((field)=>field?.trim()==="")){
        return res.status(400).json({message:"All fields are required"})
    }

    const profile_photo_path = req.files.profile_photo[0].path
    const cover_photo_path = req.files.cover_photo[0].path

    try {

        const existingUser = await User.findOne({
            $or : [{username}, {email}]}
        )
    
        if(existingUser){
            res.status(409).json({message:"username or email exits"})
            throw new Error("Email or username is already exists.");
            
        }

        let profile_photo = " "
        let cover_photo = " "

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