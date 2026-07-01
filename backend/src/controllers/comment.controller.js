import { Comment } from "../models/comment.model.js";
import { Article } from "../models/article.model.js";
import { User } from "../models/user.model.js";

export const addComment = async(req, res) => {
    try {
        // 1. Grab data from frontend (Frontend --> Controller --> DB)
        const {content} = req.body;
        const articleId = req.params.articleId;
        const userId = req.user?._id;

        // 2. Vaidation
        if(!content || !articleId){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // 3. Does Article exist?
        const article = await Article.findById(articleId);

        if(!article)
        {
            return res
            .status(400)
            .json({
                success: false,
                message: "Article does not exist"
            })
        }

        // 4.Create Comment
        const comment = await Comment.create({
            content,
            article: articleId,
            owner: userId,
        })

        // 5. Push this comment ID into Article's comments array
        const updatedArticle = await Article.findByIdAndUpdate(articleId, {
            $push: {
                comments: comment._id
            }
        }, {new: true})

        // 6. Send response
        return res
        .status(201)
        .json({
            success: true,
            message: "Comment added successfully",
            comment,
            updatedArticle
        })

    } catch (error) {
        console.log("Error in commenting : ", error);
        return res
        .status(500)
        .json({
            success: false,
            message: "Internal Server Error while commenting",
            error: error.message
        })
    }
}


export const getArticleComments = async(req, res) => {
    try {
        // 1. Grab data
        const {articleId} = req.params;

        // 2. Validate data
        if(!articleId)
        {
            return res
            .status(400)
            .json({
                message: "Article ID is missing"
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

        // 4. Fetch comments (Populate)
        const comments = await Comment.find({article: articleId}).populate("owner", "name profileImage");

        // 5. Send response
        return res
        .status(200)
        .json({
            message: "Comments fetched successfully",
            comments
        })


    } catch (error) {
        console.log("Error in getting comments : ", error);
        return res
        .status(500)
        .json({
            message: "Server error while fetching comments",
            error: error.message
        })
    }
}


export const deleteComment = async(req, res) => {
    try {
        // 1. Grab data
        const {commentId} = req.params;

        // 2. Validate
        if(!commentId)
        {
            return res
            .status(400)
            .json({
                message: "Comment ID is missing"
            })
        }

        // 3. Check if cmnt exists
        const comment = await Comment.findById(commentId);

        if(!comment)
        {
            return res
            .status(400)
            .json({
                message: "Comment does not exist"
            })
        }

        // 4. Check if user is author
        if(comment.owner.toString() !== req.user._id.toString())
        {
            return res
            .status(403)
            .json({
                message: "Forbidden: You are not the author"
            })
        }

    // 5. Delete comment from DB
    await comment.deleteOne();

    // 6. Remove comment from article's comment array
    await Article.findByIdAndUpdate(comment.article, {
        $pull: {
            comments: commentId
        }
    }, {new: true})

    // 7. Send Response
    return res
    .status(200)
    .json({
        message: "Comment deleted successfully",
        deletedComment: comment
    })


    } catch (error) {
        console.log("Error in deleting comment : ", error);
        return res
        .status(500)
        .json({
            success: false,
            message: "Error in deleting comment",
            error: error.message
        })
    }
}


export const editComment = async(req, res) => {
    try {
        // 1. Grab data
        const {commentId} = req.params;
        const {content} = req.body;

        // 2. Validate data
        if(!commentId)
        {
            return res
            .status(400)
            .json({
                message: "Comment ID is missing"
            })
        }

        // 3. Find cmnt
        const comment = await Comment.findById(commentId)
        
        if(!comment)
        {
            return res
            .status(400)
            .json({
                message: "Comment not found"
            })
        }

        // 4. Check if user is author
        if(comment.owner.toString() !== req.user._id.toString())
        {
            return res
            .status(403)
            .json({
                message: "Forbidden: You are not the author"
            })
        }

        // 5. Update cmnt
        const updateComment = await Comment.findByIdAndUpdate(commentId, {
            $set: {
                content: content
            }
        }, {new: true});

        // 6. Send response
        return res
        .status(200)
        .json({
            message: "Comment updated successfully",
            updateComment
        })

    } catch (error) {
        console.log("Error in updating comment : ", error);
        return res
        .status(500)
        .json({
            success: false,
            message: "Server error while updating comment",
            error: error.message
        })
    }
}