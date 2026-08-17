import {User} from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { uploadToS3 } from "../utils/s3.js";
import { logToCloudWatch } from "../utils/cloudwatch.js";

export const registerUser = async(req, res) => {
    try {
        // 1. Grab data from body
        const {name, email, password} = req.body;
        
        // 2. Validate that none of them are empty
        if(!name || !email || !password)
        {
            return res
            .status(400)
            .json({
                message: "All fields are required"
            })
        }

        // 3. Check if user already exists in DB
        const existingUser = await User.findOne({email})

        if(existingUser)
        {
            return res
            .status(400)
            .json({
                message: "User with this email already exists"
            })
        }

        // 4. Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Upload profile image to S3 (AWS Tier 1 Integration)
        const profileImagePath = req.files?.profileImage?.[0]?.path;
        let profileImageUrl = "";

        if(profileImagePath) {
            // Replaced uploadOnCloudinary with AWS S3 integration
            const profileImage = await uploadToS3(profileImagePath);
            if(profileImage) {
                profileImageUrl = profileImage.url;
            }
        }

        // 6. Create the user in DB
        const user = await User.create({
            name, 
            email,
            password: hashedPassword,
            ...(profileImageUrl && { profileImage: profileImageUrl })
        })

        // Send audit log to AWS CloudWatch
        await logToCloudWatch("UserAuth", { event: "UserRegistered", email: user.email, userId: user._id });

        // 7. Send response
        return res
        .status(201)
        .json({
          message: "User registered successfully",
          user 
        })

    } catch (error) {
        console.log("Signup error : ", error);
        await logToCloudWatch("UserAuth_Errors", { event: "RegistrationError", error: error.message });
        return res
        .status(500)
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

        // Send audit log to AWS CloudWatch
        await logToCloudWatch("UserAuth", { event: "UserLoggedIn", email: user.email, userId: user._id });

        // 6. Send response
        return res
        .status(200)
        .json({
            message: "User logged in successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        })

    } catch (error) {
        console.log("Login error : ", error);
        await logToCloudWatch("UserAuth_Errors", { event: "LoginError", error: error.message });
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


export const updatePassword = async(req, res) => {
    try {
        // 1. Grab data from body
        const {oldPassword, newPassword, confirmPassword} = req.body;

        // 2. Validate data
        if(!oldPassword || !newPassword || !confirmPassword)
        {
            return res
            .status(400)
            .json({
                message: "All fields are required"
            })
        }

        // 3. Validate that newPassword and confirmPassword are same
        if(newPassword !== confirmPassword)
        {
            return res
            .status(401)
            .json({
                message: "Passwords did not match"
            })
        }
    
        // 4. Validate that oldPassword and newPassword are not same
        if(oldPassword === newPassword)
        {
            return res
            .status(401)
            .json({
                message: "Old password and new password is same"
            })
        }
    
        // 5. Fetch user from DB
        const user = await User.findById(req.user._id);

        // 6. Compare old Password
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    
        if(!isPasswordCorrect)
        {
            return res
            .status(400)
            .json({
                message: "Incorrect Password"
            })
        }
    
        // 7. Hash the new Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 8. Update the user's password
        user.password = hashedPassword;
    
        await user.save({validateBeforeSave: false})
    
        // 9. Send response
        return res
        .status(200)
        .json({
            message: "Password updated successfully"
        })
        
    } catch (error) {
        console.log("Update password error : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}


export const updateAccountDetails = async(req, res) => {
    try {
        // 1. Grab data from body
        const {name, email} = req.body;
    
        // 2. Validate data
        if(!name || !email)
        {
            return res
            .status(400)
            .json({
                message: "Name and email are required"
            })
        }
    
        // 3. Update the user in DB
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    name: name,
                    email: email.toLowerCase()
                }
            },
            {
                returnDocument: "after"
            }
        ).select("-password")
    
        // 4. Send response
        return res  
        .status(200)
        .json({
            message: "Account details updated successfully",
            user
        })
        
    } catch (error) {
        console.log("Update account details error : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}


export const updateProfileImg = async(req, res) => {
    try {
        // req.file is provided by our Multer middleware!
        const profileImglFilePath = req.file?.path;
    
        if(!profileImglFilePath) 
        {
            return res
            .status(400)
            .json({
                message: "Profile image is missing"
            })
        }
    
        // upload on cloudinary
        const profileImage = await uploadOnCloudinary(profileImglFilePath);
    
        if(!profileImage) {
            return res
            .status(500)
            .json({
                message: "Error while uploading image on cloudinary"
            })
        }
    
        // Update user with new image
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    profileImage: profileImage.url
                }
            },
            {
                returnDocument: "after"
            }
        ).select("-password");
    
        return res
        .status(200)
        .json({
            message: "Profile image updated successfully",
            user
        })
    } catch (error) {
        console.log("Update profile image error : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}