import {
  insertBattle,
  findBattleById,
  findAllBattles,
} from "../models/battleModel.js";
import { logger } from "../helpers/logger.js";

export const getBattles = async (req, res) => {
  try {
    findAllBattles((err, battles) => {
      if (err) {
        logger.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
      res.status(200).json({ success: true, battles });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getBattle = async (req, res) => {
  try {
    const battleId = req.params.id;
    findBattleById(battleId, (err, battle) => {
      if (err || !battle) {
        logger.error(err);
        return res
          .status(404)
          .json({ success: false, message: "Battle not found" });
      }
      res.status(200).json({ success: true, battle });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createBattle = async (req, res) => {
  try {
    const { title, description, topic, difficulty, length } = req.body;
    if (!title || !description || !topic || !difficulty || !length)
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });

    const newBattle = {
      title,
      description,
      user_id: req.user.id,
      topic,
      difficulty,
      length,
    };
    insertBattle(newBattle, (err, result) => {
      if (err) {
        logger.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
      res
        .status(201)
        .json({ success: true, message: "Battle created successfully!" });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
