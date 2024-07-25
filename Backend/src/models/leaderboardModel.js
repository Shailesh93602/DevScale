import { Sequelize } from "sequelize";
import User from "./userModel.js";
import { UserPoints } from "./userPointsModel.js"; // Assuming you have a model for user points

// Function to get leaderboard data from the database
export const getLeaderboardData = async () => {
  try {
    const leaderboard = await User.findAll({
      attributes: [
        "id",
        "username",
        [
          Sequelize.fn("SUM", Sequelize.col("user_points.points")),
          "total_points",
        ],
      ],
      include: [
        {
          model: UserPoints,
          attributes: [],
        },
      ],
      group: ["User.id", "User.username"],
      order: [[Sequelize.literal("total_points"), "DESC"]],
      limit: 10,
    });
    return leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard data from the database:", error);
    throw new Error("Database Error: Unable to fetch leaderboard data");
  }
};
