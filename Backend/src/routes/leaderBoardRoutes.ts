import express from 'express';
import { getLeaderboardEntries } from '../controllers/leaderBoardControllers';

const router = express.Router();

router.get('/', getLeaderboardEntries);

export default router;
