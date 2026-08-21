import {Router} from "express";
import {loginUser, logoutUser, registerUser, updateAccountDetails, updatePassword, updateProfileImg, removeProfileImg} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", 
    upload.fields([
        { 
            name: "profileImage", 
            maxCount: 1 
        }
    ]), 
    registerUser
);

router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.patch("/update-password", verifyJWT, updatePassword);
router.patch("/update-account", verifyJWT, updateAccountDetails);
router.patch("/profile-image", verifyJWT, upload.single("profileImage"), updateProfileImg);
router.delete("/profile-image", verifyJWT, removeProfileImg);

export default router;