import { Router } from "express";
import {
    addComment,
    getArticleComments,
    deleteComment,
    editComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.post("/new-comment/:articleId", verifyJWT, addComment);
router.get("/all-comments/:articleId", getArticleComments);
router.patch("/update-comment/:commentId", verifyJWT, editComment);
router.delete("/delete-comment/:commentId", verifyJWT, deleteComment);


export default router;
