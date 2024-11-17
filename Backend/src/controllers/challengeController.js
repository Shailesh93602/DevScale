import { Op } from "sequelize";
import db from "../../db/models/index.js";

export const getChallenges = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const offset = (pageNumber - 1) * pageSize;

    const whereCondition = search
      ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows: challenges } = await db.Challenge.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / pageSize);

    res.status(200).json({
      challenges,
      currentPage: pageNumber,
      totalPages,
      totalChallenges: count,
    });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;

    if (id) {
      const challenge = await db.Challenge.findByPk(id);

      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      return res.status(200).json(challenge);
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const offset = (pageNumber - 1) * pageSize;

    const whereCondition = search
      ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows: challenges } = await db.Challenge.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / pageSize);

    res.status(200).json({
      challenges,
      currentPage: pageNumber,
      totalPages,
      totalChallenges: count,
    });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
