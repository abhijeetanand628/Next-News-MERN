import mongoose, {Schema} from "mongoose";


const articleSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    category: {
        type: String,
        required: true,
        enum: ['Technology', 'Sports', 'Entertainment', 'Health', 'Business', 'General', 'Gaming'],
    },
    articleImage: {
        type: String,
        required: true,
    },
    likesCount: {
        type: Number,
        default: 0,
    },
    viewsCount: {
        type: Number,
        default: 0,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
}, {timestamps: true})


export const Article = mongoose.model("Article", articleSchema);