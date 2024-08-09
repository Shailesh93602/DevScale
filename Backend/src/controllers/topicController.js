import db from "../../db/models/index.js";
import { Op, Sequelize } from "sequelize";
import { logger } from "../helpers/logger.js";

export const getUnpublishedTopics = async (req, res) => {
  try {
    const topics = await db.Topic.findAll({
      where: {
        id: {
          [Op.in]: Sequelize.literal(`(
            SELECT DISTINCT \`Topics\`.\`id\`
            FROM \`Topics\`
            LEFT JOIN \`Articles\` ON \`Articles\`.\`topicId\` = \`Topics\`.\`id\`
            WHERE \`Articles\`.\`status\` IS NULL
            OR \`Articles\`.\`status\` != 'approved'
          )`),
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Unpublished topics retrieved successfully",
      topics,
    });
  } catch (error) {
    logger.error("Error retrieving unpublished topics:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
