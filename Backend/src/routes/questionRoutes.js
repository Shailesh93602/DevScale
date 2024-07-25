import express from "express";
import {
  getQuestions,
  submitQuestions,
} from "../controllers/questionControllers.js";

const router = express.Router();

// Route to get questions
router.get("/", getQuestions);

// Route to submit answers to questions
router.post("/submit", submitQuestions);

export default router;
