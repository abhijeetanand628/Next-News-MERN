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
    }
})


export const Article = mongoose.model("Article", articleSchema);