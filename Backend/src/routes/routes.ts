import express, { Request, Response } from 'express';
import userRoutes from './userRoutes';
import roadMapRoutes from './roadMapRoutes';
import questionRoutes from './questionRoutes';
import leaderBoardRoutes from './leaderBoardRoutes';
import placementRoutes from './placementRoutes';
import communityForumRoutes from './communityForumRoutes';
import jobRoutes from './jobRoutes';
import chatRoutes from './chatRoutes';
import courseRoutes from './courseRoutes';
import battleRoutes from './battleRoutes';
import resourceRoutes from './resourceRoutes';
import mainConceptRoutes from './mainConceptRoutes';
import subjectRoutes from './subjectRoutes';
import topicRoutes from './topicRoutes';
import articleRoutes from './articleRoutes';
import quizRoutes from './quizRoutes';
import challengeRoutes from './challengeRoutes';
import { codeRunner } from '../controllers/codeRunnerController';
import { predict } from '../controllers/predictionController';
import healthCheckRoutes from './healthCheck';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();

router.get('/helloworld', (req: Request, res: Response) => {
  res.send('Hello World!');
});

router.post('/predict', predict);

router.use('/users', authMiddleware, userRoutes);

router.use('/roadMaps', authMiddleware, roadMapRoutes);

router.use('/questions', authMiddleware, questionRoutes);

router.use('/leaderBoard', authMiddleware, leaderBoardRoutes);

router.use('/placements', authMiddleware, placementRoutes);

router.use('/community/forums', authMiddleware, communityForumRoutes);

router.use('/jobs', authMiddleware, jobRoutes);

router.use('/chats', authMiddleware, chatRoutes);

router.use('/courses', authMiddleware, courseRoutes);

router.use('/battles', authMiddleware, battleRoutes);

router.use('/resources', authMiddleware, resourceRoutes);

router.use('/main-concepts', authMiddleware, mainConceptRoutes);

router.use('/subjects', authMiddleware, subjectRoutes);

router.use('/topics', authMiddleware, topicRoutes);

router.use('/articles', authMiddleware, articleRoutes);

router.use('/quiz', authMiddleware, quizRoutes);

router.use('/challenges', authMiddleware, challengeRoutes);

router.post('/run-code', authMiddleware, codeRunner);

// Health Check Route
router.use(
  '/health',
  authMiddleware,

  healthCheckRoutes
);

export default router;
