import mongoose, {Schema} from "mongoose";

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article"
    }
}, {timestamps: true})



export const Comment = mongoose.model("Comment", commentSchema);