import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],    
    },

    profileImage: {
        type: String
    }
}, {timestamps: true})


export const User = mongoose.model("User", userSchema);