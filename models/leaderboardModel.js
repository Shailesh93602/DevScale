import { Sequelize } from "sequelize";
import User from "./userModel.js";
import { UserPoints } from "./userPointsModel.js";

export const getLeaderBoardData = async () => {
  try {
    const leaderBoard = await User.findAll({
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
    return leaderBoard;
  } catch (error) {
    console.error("Error fetching leaderBoard data from the database:", error);
    throw new Error("Database Error: Unable to fetch leaderBoard data");
  }
};
