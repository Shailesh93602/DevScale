import express from "express";
import { getLeaderBoard } from "../controllers/leaderBoardControllers.js";

const router = express.Router();

// Route to get the leaderboard
router.get("/", getLeaderBoard);

export default router;
