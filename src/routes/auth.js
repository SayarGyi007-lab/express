import { Router } from "express";
import { register } from "../controller/auth.js";
import {upload} from "../middleware/multer.js";


const registeration = Router();

registeration.post("/register",
    upload.fields([
       { name: "profile_photo", maxCount:1},
       {name: "cover_photo", maxCount:1}
    ])
    ,register)

export default registeration;