import {Router} from "express";

const router = Router();

router.post("/signup", (req, res) => {
    console.log("Signup data received: ", req.body);
    res.status(200)
    .json({ message: "Signup route hit successfully!" })
});

router.post("/login", (req, res) => {
    console.log("Login data received: ", req.body);
    res.status(200)
    .json({ message: "Login route hit successfully!" })
});

export default router;