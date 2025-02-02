import express from 'express';
import { createQuiz, submitQuiz } from '../controllers/quizController.js';
const router = express.Router();

router.post('/create', createQuiz);
router.post('/submit', submitQuiz);

export default router;
