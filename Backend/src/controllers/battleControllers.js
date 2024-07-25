import Battle from "../models/battleModel.js"; // Ensure you have a Sequelize model for Battle
import { logger } from "../helpers/logger.js";

export const getBattles = async (req, res) => {
  try {
    const battles = await Battle.findAll(); // Fetch all battles using Sequelize
    res.status(200).json({ success: true, battles });
  } catch (error) {
    logger.error("Error fetching battles:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getBattle = async (req, res) => {
  try {
    const battleId = req.params.id;
    const battle = await Battle.findByPk(battleId); // Fetch battle by primary key using Sequelize
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
    const { title, description, topic, difficulty, length } = req.body;
    if (!title || !description || !topic || !difficulty || !length) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });
    }

    const newBattle = {
      title,
      description,
      userId: req.user.id, // Make sure this matches your model field
      topic,
      difficulty,
      length,
    };

    await Battle.create(newBattle); // Create a new battle using Sequelize
    res
      .status(201)
      .json({ success: true, message: "Battle created successfully!" });
  } catch (error) {
    logger.error("Error creating battle:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
