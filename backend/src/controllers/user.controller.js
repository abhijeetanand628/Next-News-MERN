import {User} from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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


export const loginUser = async(req, res) => {
    try {
        // 1. Grab data
        const {email, password} = req.body;

        // 2. Validate data
        if(!email || !password)
        {
            return res
            .status(400)
            .json({
                message: "Email and password are required"
            })
        }

        // 3. Check if user exists in DB
        const user = await User.findOne({email});

        if(!user)
        {
            return res
            .status(404)
            .json({
                message: "User not found"
            })
        }

        // 4. Compare encrypted password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid)
        {
            return res
            .status(401)
            .json({
                message: "Password Incorrect"
            })
        }

        // 5. Generate JWT token
        const token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );

        // 6. Send response
        return res
        .status(200)
        .json({
            message: "User logged in successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                
            }
        })

    } catch (error) {
        console.log("Login error : ", error);
        res.status(500)
        .json({
            message: "Server error"
        });
    }
}


export const logoutUser = async(req, res) => {
    try {
        // Remove token from user
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    token: 1
                }
            },
            {
                returnDocument: "after"
            }   
        );

        // Clear the cookie
        return res
        .status(200)
        .json({
            message: "User logged out successfully"
        })

    } catch (error) {
        console.log("Logout error : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}