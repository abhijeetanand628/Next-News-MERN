import { Article } from "../models/article.model.js";
import { User } from "../models/user.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

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

        const allowedCategories = ['Technology', 'Sports', 'Entertainment', 'Health', 'Business', 'General', 'Gaming'];
        if(!allowedCategories.includes(category))
        {
            return res
            .status(400)
            .json({
                message: "Invalid category"
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
        const { search = "", page = 1, limit = 10 } = req.query;
        
        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                    { category: { $regex: search, $options: "i" } }
                ]
            };
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const totalArticles = await Article.countDocuments(query);

        // 1. Fetch articles
        const articles = await Article.find(query)
            .populate("author", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        // 2. Send response
        return res
        .status(200)
        .json({
            message: "Articles fetched successfully",
            articles,
            totalArticles,
            totalPages: Math.ceil(totalArticles / limitNumber),
            currentPage: pageNumber
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
        const article = await Article.findById(articleId).populate("author", "name profileImage");

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


export const getMyArticles = async(req, res) => {
    try {
        // 1. Grab data
        const userId = req.user._id;

        // 2. Validate
        if(!userId)
        {
            return res
            .status(400)
            .json({
                message: "User ID not found"
            })
        }

        // 3. Fetch articles written by the user
        const articles = await Article.find({author: userId}).sort({ createdAt: -1 });

        // 4. Calculate aggregate statistics
        let totalViews = 0;
        let totalLikes = 0;
        let totalComments = 0;
        // let totalShares = 0;

        articles.forEach(article => {
            totalViews += article.viewsCount || 0;
            totalLikes += article.likesCount || 0;
            totalComments += article.commentsCount || 0;
            // totalShares += article.sharesCount || 0;
        });

        // 5. Send Response
        return res
        .status(200)
        .json({
            success: true,
            message: "My articles fetched successfully",
            articles,
            stats: {
                totalPosts: articles.length,
                totalLikes,
                totalViews,
                totalComments,
                // totalShares
            }
        })

    } catch (error) {
        console.log("Error in fetching my articles : ", error);
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
        if(article.author.toString() !== req.user._id.toString())
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
            deleteFromCloudinary(article.articleImage);
            articleImage = uploadedImage.url;
        }

        // 6. Update fields
        const {title, description, content, category} = req.body;
        
        if (category) {
            const allowedCategories = ['Technology', 'Sports', 'Entertainment', 'Health', 'Business', 'General', 'Gaming'];
            if (!allowedCategories.includes(category)) {
                return res.status(400).json({
                    message: "Invalid category"
                });
            }
        }

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

        if(!article)
        {
            return res
            .status(404)
            .json({
                message: "Article not found"
            })
        }

        // 4.Check if user is author
        if(article.author.toString() !== req.user._id.toString())
        {
            return res
            .status(401)
            .json({
                message: "Unauthorized"
            })
        }

        // 5. Delete article image from cloudnary
        deleteFromCloudinary(article.articleImage);
        
        // 6. Delete article from DB
        await Article.findByIdAndDelete(articleId);

        // 7. Send response
        return res
        .status(200)
        .json({
            success: true,
            message: "Article deleted successfully"
        })
    
    } catch (error) {
        console.log("Article deletion error : ", error);
        return res
        .status(500)
        .json({
            success: false,
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


export const getLikedArticles = async(req, res) => {
    try {
        // 1. Grab data
        const userId = req.user._id;
        
        // 2. Find articles where the user's ID is in the 'likes' array
        const articles = await Article.find({ likes: userId })
        .populate('author', 'name')
        .sort({updatedAt: -1})

        // 3. Send response
        return res
        .status(200)
        .json({
            success: true,
            message: "Liked articles fetched successfully",
            articles
        })
        
    } catch (error) {
        console.log("Error in getting liked articles : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}


export const toggleSavedArticle = async(req, res) => {
    try {
        // 1. Grab data
        const {articleId} = req.params;
        const userId = req.user._id;
        
        // 2. Validate data
        if(!articleId || !userId)
        {
            return res
            .status(400)
            .json({
                message: "Article ID and User ID are required"
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

        // 4. Check if user already saved
        const savedUser = await User.findById(userId);

        if(!savedUser)
        {
            return res
            .status(400)
            .json({
                message: "User not found"
            })
        }

        // 5. Toggle the article in savedArticles
        const isSaved = savedUser.savedArticles.includes(articleId);

        if(isSaved)
        {
            // Remove article
            savedUser.savedArticles.pull(articleId);
            savedUser.savedCount--;
        }
        else
        {
            // Add article
            savedUser.savedArticles.push(articleId);
            savedUser.savedCount++;
        }

        await savedUser.save();

        // 6. Send response
        return res
        .status(200)
        .json({
            message: "Article toggled successfully",
            savedUser
        })

    } catch (error) {
        console.log("Error in toggling saved article : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}


export const getSavedArticles = async(req, res) => {
    try {
        // 1. Grab data
        const userId = req.user._id;

        // 2. Validate user
        if(!userId)
        {
            return res
            .status(400)
            .json({
                message: "User ID is required"
            })
        }

        // 3. Find articles saved by user
        const user = await User.findById(userId).select("savedArticles");
        
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const articles = await Article.find({ _id: { $in: user.savedArticles } })
        .populate('author', 'name')
        .sort({updatedAt: -1})

        // 4. Send response
        return res
        .status(200)
        .json({
            success: true,
            message: "Saved articles fetched successfully",
            articles
        })
        
    } catch (error) {
        console.log("Error in getting saved articles : ", error);
        return res
        .status(500)
        .json({
            message: "Server error"
        })
    }
}