import { Article } from "../models/article.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createNewArticle = async(req, res) => {
    try {
        // 1. Grab data
        const {title, description, content, category} = req.body;

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
            articleImage: articleImage.url,
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


export const getArticleById = async(req, res) => {
    try {
        // 1. Grab data
        const {articleId} = req.params;

        // 2. Validate data
        if(!articleId)
        {
            return res
            .status(400)
            .json({
                message: "Article ID is required"
            })
        }

        // 3. Fetch article
        const article = await Article.findById(articleId);

        if(!article)
        {
            return res
            .status(404)
            .json({
                message: "Article not found"
            })
        }

        // 4. Send response
        return res
        .status(200)
        .json({
            message: "Article fetched successfully",
            article
        })

    } catch (error) {
        console.log("Error in fetching article by id : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}


export const updateArticle = async(req, res) => {
    try {
        // 1. Grab data
        const {articleId} = req.params;

        // 2. Validate data
        if(!articleId) {
            return res
            .status(400)
            .json({
                message: "Article ID is required"
            })
        }

        // 3. Find article
        const article = await Article.findById(articleId);

        if(!article)
        {
            return res
            .status(404)
            .json({
                message: "Article not found"
            })
        }

        // 4. Check if user is author
        if(article.author !== req.user._id)
        {
            return res
            .status(401)
            .json({
                message: "Unauthorized"
            })
        }

        // 5. Upload new article image if provided
        const articleImagePath = req.files?.articleImage?.[0]?.path;

        let articleImage = article.articleImage;

        if(articleImagePath) {
            const uploadedImage = await uploadOnCloudinary(articleImagePath);

            if(!uploadedImage)
            {
                return res
                .status(400)
                .json({
                    message: "Article image upload failed"
                })
            }

            articleImage = uploadedImage.url;
        }

        // 6. Update fields
        const {title, description, content, category} = req.body;
        
        const updatedArticle = await Article.findByIdAndUpdate(articleId, {
            $set: {
                title: title,
                description: description,
                content: content,
                category: category,
                articleImage: articleImage,
            }
        }, {new: true});

        // 7. Send response
        return res
        .status(200)
        .json({
            message: "Article updated successfully",
            updatedArticle
        })

    } catch (error) {
        console.log("Article update error : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}


export const deleteArticle = async(req, res) => {
    try {
        // 1. grab data
        const {articleId} = req.params;

        // 2. Validate data
        if(!articleId)
        {
            return res
            .status(400)
            .json({
                message: "Article ID is required"
            })
        }

        // 3. Check if it exists
        const article = await Article.findById(articleId);

        if(!articleId)
        {
            return res
            .status(404)
            .json({
                message: "Article not found"
            })
        }

        // 4.Check if user is author
        if(article.author !== req.user._id)
        {
            return res
            .status(401)
            .json({
                message: "Unauthorized"
            })
        }

        // 5. Delete article
        await Article.findByIdAndDelete(articleId);

        // 6. Send response
        return res
        .status(200)
        .json({
            message: "Article deleted successfully"
        })
    
    } catch (error) {
        console.log("Article deletion error : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}


export const likeArticle = async(req, res) => {
    try {
        const {articleId} = req.params;

        if(!articleId)
        {
            return res
            .status(400)
            .json({
                message: "Article ID is required"
            })
        }

        const article = await Article.findById(articleId);
        
        if(!article)
        {
            return res
            .status(404)
            .json({
                message: "Article not found"
            })  
        }

        // Check if user already liked
        const userLiked = article.likes.includes(req.user._id);

        if(userLiked)
        {
            // Unlike it
            article.likes = article.likes.filter((like) => like.toString() !== req.user._id.toString());
            article.likesCount--;
        }
        else
        {
            // Like it
            article.likes.push(req.user._id);
            article.likesCount++;
        }

        await article.save();

        return res
        .status(200)
        .json({
            message: "Article liked/unliked successfully",
            article
        })

    } catch (error) {
        console.log("Error in liking article : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}