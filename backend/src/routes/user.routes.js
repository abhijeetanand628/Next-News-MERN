import {Router} from "express";
import {registerUser} from "../controllers/user.controller.js";

const router = Router();

router.post("/signup", registerUser);

router.post("/login", (req, res) => {
    console.log("Login data received: ", req.body);
    res.status(200)
    .json({ message: "Login route hit successfully!" })
});

export default router;