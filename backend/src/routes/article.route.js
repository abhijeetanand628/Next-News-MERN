import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createNewArticle,
    getAllArticles,
    getArticleById,
    likeArticle,
    deleteArticle,
    updateArticle,
    getMyArticles,
    getLikedArticles,
    toggleSavedArticle,
    getSavedArticles
} from "../controllers/article.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/new-article", verifyJWT, 
    upload.fields([
        {
            name: "articleImage",
            maxCount: 1,
        }
    ]),
    createNewArticle
);

router.get("/all-articles", getAllArticles);
router.get("/article/:articleId", getArticleById);
router.patch("/article/:articleId/update", verifyJWT, 
    upload.fields([
        {
            name: "articleImage",
            maxCount: 1,
        }
    ]),
    updateArticle
)
router.delete("/article/:articleId/delete", verifyJWT, deleteArticle)
router.post("/article/:articleId/like", verifyJWT, likeArticle)
router.get("/my-articles", verifyJWT, getMyArticles)
router.get("/liked-articles", verifyJWT, getLikedArticles)
router.post("/article/:articleId/save", verifyJWT, toggleSavedArticle)
router.get("/saved-articles", verifyJWT, getSavedArticles)

export default router;