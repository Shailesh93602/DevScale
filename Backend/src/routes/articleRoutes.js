import express from "express";
import {
  getArticleById,
  getArticleComments,
  getArticles,
  getMyArticles,
  updateArticleContent,
  updateArticleStatus,
  updateModerationNotes,
} from "../controllers/articleController.js";

const router = express.Router();

router.get("/all", getArticles);
router.post("/status", updateArticleStatus);
router.post("/:id/moderation", updateModerationNotes);
router.get("/my-articles", getMyArticles);
router.get("/:id/comments", getArticleComments);
router.post("/:id/update", updateArticleContent);
router.get("/:id", getArticleById);

export default router;
