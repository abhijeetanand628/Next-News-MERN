import {User} from "../models/user.model.js";
import bcrypt from "bcrypt";

export const registerUser = async(req, res) => {
    try {
        // 1. Grab data from body
        const {name, email, password, profileImage} = req.body;
        
        // 2. Validate that none of them are empty
        if(!name || !email || !password)
        {
            return res.status(400)
            .json({
                message: "All fields are required"
            })
        }

        // 3. Check if user already exists in DB
        const existingUser = await User.findOne({email})

        if(existingUser)
        {
            return res.status(400)
            .json({
                message: "User with this email already exists"
            })
        }

        // 4. Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Create the user
        const user = await User.create({
            name, 
            email,
            password: hashedPassword,
            profileImage
        })

        // 6. Send response
        return res.status(201)
        .json({
          message: "User registered successfully",
          user 
        })

    } catch (error) {
        console.log("Signup error : ", error);
        res.status(500)
        .json({
            message: "Server error"
        });
    }
}