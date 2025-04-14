import { Router } from "express";
import { changeEmailController, changePasswordController, changeUsernameController, generateNewRefreshToken, loginController, logoutController, register } from "../controller/auth.js";
import {upload} from "../middleware/multer.js";
import { verifyJWT } from "../middleware/auth.js";


const router = Router();

router.post("/register",
    upload.fields([
       { name: "profile_photo", maxCount:1},
       {name: "cover_photo", maxCount:1}
    ])
    ,register)

router.post("/login",loginController)
router.post("/refresh",generateNewRefreshToken)
router.post("/logout",verifyJWT,logoutController)
router.put("/updateusername/:id",changeUsernameController)
router.put("/updateEmail/:id",changeEmailController)
router.put("/updatePassword/:id",changePasswordController)

export default router;