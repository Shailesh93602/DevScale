import db from "../../db/models/index.js";
import { Op } from "sequelize";
import { logger } from "../helpers/logger.js";

export const getUnpublishedTopics = async (req, res) => {
  try {
    const topics = await db.Topic.findAll({
      include: [
        {
          model: db.Article,
          attributes: ["id", "status"],
          required: false,
          where: {
            status: { [Op.ne]: "approved" },
          },
        },
      ],
      where: {
        "$Articles.id$": null,
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
