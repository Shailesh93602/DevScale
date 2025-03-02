import express from 'express';
import {
  getArticlesForTopic,
  getQuizByTopicId,
  getUnpublishedTopics,
  submitQuiz,
} from '../controllers/topicController.js';

const router = express.Router();

router.get('/:id/articles', getArticlesForTopic);
router.get('/:id/article', getArticlesForTopic);
router.get('/:id/quiz', getQuizByTopicId);
router.post('/quiz/submit', submitQuiz);
router.get('/unpublished', getUnpublishedTopics);

export default router;
