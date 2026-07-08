import { Router } from "express";
import { getTopHeadlines, searchNews } from "../controllers/news.controller.js";

const router = Router();

router.get("/top-headlines", getTopHeadlines);
router.get("/everything", searchNews);

export default router;
