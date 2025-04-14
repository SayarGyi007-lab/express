import jwt from "jsonwebtoken"
import { User } from "../model/user.js"

export const verifyJWT = async(req,res,next)=>{
    

    const incomingToken = req.cookies.accessToken || req.header("Authorization")
    if(!incomingToken){
        return res.status(401).json({message:"no token Unauthorization"})
    }
    console.log(incomingToken)
    try {
        const decodedToken = jwt.decode(incomingToken)
        console.log(decodedToken)
        if(!decodedToken?._id){
            return res.status(401).json({message:"decode token Unauthorization"})
        }
        const existingUser = await User.findById(decodedToken?._id).select("-password -refresh_token")
        if(!existingUser){
            return res.status(404).json({message:"No User Found"})
        }
        req.user = existingUser
        next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal Server Error middleware"})
    }
}