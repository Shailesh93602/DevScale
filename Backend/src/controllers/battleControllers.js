import db from "../../db/models/index.js";
import { logger } from "../helpers/logger.js";

export const getBattles = async (req, res) => {
  try {
    const battles = await db.Battle.findAll({
      order: [["createdAt", "ASC"]],
      include: {
        model: db.Topic,
        attributes: ["title"],
      },
    });
    res.status(200).json({ success: true, battles });
  } catch (error) {
    logger.error("Error fetching battles:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getBattle = async (req, res) => {
  try {
    const battleId = req.params.id;
    const battle = await db.Battle.findByPk(battleId);
    if (!battle) {
      return res
        .status(404)
        .json({ success: false, message: "Battle not found" });
    }
    res.status(200).json({ success: true, battle });
  } catch (error) {
    logger.error("Error fetching battle:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createBattle = async (req, res) => {
  try {
    const { title, description, topicId, difficulty, length, date, time } =
      req.body;

    const newBattle = {
      title,
      description,
      userId: req.user.id,
      topicId,
      difficulty,
      length,
      date,
      time,
    };

    await db.Battle.create(newBattle);
    res
      .status(201)
      .json({ success: true, message: "Battle created successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
