import { logger } from "../helpers/logger.js";
import { getLeaderboardData } from "../models/leaderboardModel.js";

export const getLeaderBoard = async (req, res) => {
  try {
    const leaderboard = await getLeaderboardData();
    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    logger.error("Error in getLeaderBoard:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
