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
import passport from 'passport';
import { codeRunner } from '../controllers/codeRunnerController';
import { predict } from '../controllers/predictionController';
import healthCheckRoutes from './healthCheck';

const router = express.Router();

router.get('/helloworld', (req: Request, res: Response) => {
  res.send('Hello World!');
});

router.post('/predict', predict);

router.use(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  userRoutes
);

router.use(
  '/roadMaps',
  passport.authenticate('jwt', { session: false }),
  roadMapRoutes
);

router.use(
  '/questions',
  passport.authenticate('jwt', { session: false }),
  questionRoutes
);

router.use(
  '/leaderBoard',
  passport.authenticate('jwt', { session: false }),
  leaderBoardRoutes
);

router.use(
  '/placements',
  passport.authenticate('jwt', { session: false }),
  placementRoutes
);

router.use(
  '/community/forums',
  passport.authenticate('jwt', { session: false }),
  communityForumRoutes
);

router.use(
  '/jobs',
  passport.authenticate('jwt', { session: false }),
  jobRoutes
);

router.use(
  '/chats',
  passport.authenticate('jwt', { session: false }),
  chatRoutes
);

router.use(
  '/courses',
  passport.authenticate('jwt', { session: false }),
  courseRoutes
);

router.use(
  '/battles',
  passport.authenticate('jwt', { session: false }),
  battleRoutes
);

router.use(
  '/resources',
  passport.authenticate('jwt', { session: false }),
  resourceRoutes
);

router.use(
  '/main-concepts',
  passport.authenticate('jwt', { session: false }),
  mainConceptRoutes
);

router.use(
  '/subjects',
  passport.authenticate('jwt', { session: false }),
  subjectRoutes
);

router.use(
  '/topics',
  passport.authenticate('jwt', { session: false }),
  topicRoutes
);

router.use(
  '/articles',
  passport.authenticate('jwt', { session: false }),
  articleRoutes
);

router.use(
  '/quiz',
  passport.authenticate('jwt', { session: false }),
  quizRoutes
);

router.use(
  '/challenges',
  passport.authenticate('jwt', { session: false }),
  challengeRoutes
);

router.post('/run-code', codeRunner);

// Health Check Route
router.use('/health', healthCheckRoutes);

export default router;
