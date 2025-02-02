import express from 'express';
import {
  getQuestions,
  submitQuestions,
} from '../controllers/questionControllers.js';

const router = express.Router();

router.get('/', getQuestions);
router.post('/submit', submitQuestions);

export default router;
