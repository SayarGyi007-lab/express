import cloudinary from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()


cloudinary.config({ 
    cloud_name: 'dtrqav44c', 
    api_key: '564479735666873', 
    api_secret: process.env.CLOUDINARY_KEY // Click 'View API Keys' above to copy your API secret
});

export const uploadToCloudinary= async (filePath)=>{
    try {
        if(!filePath) return null
        const uploadResult = await cloudinary.uploader.upload(filePath,{
               resource_type: "auto",
           }
       );
       console.log("file upload good!",uploadResult.url);
       console.log(filePath);
       fs.unlinkSync(filePath);
       return uploadResult.url;
      
    } catch (error) {
        console.log(error)
        fs.unlinksync(filePath)
        return null
    }
}