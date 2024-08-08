import express from "express";
import {
  getArticleById,
  getArticles,
  updateArticleStatus,
} from "../controllers/articleController.js";

const router = express.Router();

router.get("/all", getArticles);
router.post("/status", updateArticleStatus);
router.get("/:id", getArticleById);

export default router;
