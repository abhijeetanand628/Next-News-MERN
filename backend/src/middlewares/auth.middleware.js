import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async(req, res, next) => {
    try {
        // 1. Grab the token from the request headers
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

        // 2. Validate token
        if(!token)
        {
            return res
            .status(401)
            .json({
                message: "Token not found",
            })
        }

        // 3. Decode JWT token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find user
        const user = await User.findById(decodedToken?.id).select("-password");

        if(!user)
        {
            return res
            .status(401)
            .json({
                message: "Invalid Token"        
            })
        }

        // 5. Attach user to request
        req.user = user;
        next();

    } catch (error) {
        return res
        .status(401)
        .json({
            message: "Invalid or expired token"
        })
    }
}