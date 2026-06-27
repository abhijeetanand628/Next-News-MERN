import { Article } from "../models/article.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Comment } from "../models/comment.model.js";   

export const createNewArticle = async(req, res) => {
    try {
        // 1. Grab data
        const {title, description, content, category } = req.body;

        // 2. Validate data
        if(!title || !description || !content || !category)
        {
            return res
            .status(400)
            .json({
                message: "All fields are required"
            })
        }

        // 3. Upload article image to Cloudinary
        const articleImagePath = req.files?.articleImage?.[0]?.path;

        if(!articleImagePath) 
        {
            return res
            .status(400)
            .json({
                message: "Article image is required"
            })
        }

        // 4. Upload article image to Cloudinary
        const articleImage = await uploadOnCloudinary(articleImagePath);

        if(!articleImage)
        {
            return res
            .status(400)
            .json({
                message: "Article image upload failed"
            })
        }

        // 5. Create article
        const article = await Article.create({
            title,
            description,
            content,
            category,
            imageUrl: articleImage.url,
            author: req.user._id,
        });

        // 6. Send response
        return res
        .status(201)
        .json({
            message: "Article created successfully",
            article
        })

    } catch (error) {
        console.log("Article creation error : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}


export const getAllArticles = async(req, res) => {
    try {
        // 1. Fetch all articles
        const articles = await Article.find().populate("author", "name");

        // 2. Send response
        return res
        .status(200)
        .json({
            message: "Articles fetched successfully",
            articles
        })

    } catch (error) {
        console.log("Article fetch error : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}