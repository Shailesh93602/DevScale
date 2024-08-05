import express from "express";
import {
  getArticles,
  updateArticleStatus,
} from "../controllers/articleController.js";

const router = express.Router();

router.get("/all", getArticles);
router.post("/status", updateArticleStatus);

export default router;
