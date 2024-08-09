import express from "express";
import {
  getArticleById,
  getArticles,
  updateArticleStatus,
  updateModerationNotes,
} from "../controllers/articleController.js";

const router = express.Router();

router.get("/all", getArticles);
router.post("/status", updateArticleStatus);
router.get("/:id", getArticleById);
router.post("/:id/moderation", updateModerationNotes);

export default router;
