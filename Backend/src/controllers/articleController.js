import db from "../../db/models/index.js";
import { Op } from "sequelize";

export const getArticles = async (req, res) => {
  try {
    const { status, search } = req.query;

    let whereCondition = {};

    if (status) {
      whereCondition.status = status;
    }

    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const articles = await db.Article.findAll({
      where: whereCondition,
      include: [
        {
          model: db.User,
          as: "author",
          attributes: ["username"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Articles fetched successfully",
      articles,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateArticleStatus = async (req, res) => {
  const { id, status } = req.query;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const article = await db.Article.findByPk(id);

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    article.status = status;
    await article.save();

    res.status(200).json({ message: "Article status updated successfully" });
  } catch (error) {
    console.error("Error updating article status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getArticleById = async (req, res) => {
  const { id } = req.params;
  try {
    const article = await db.Article.findByPk(id, {
      include: {
        model: db.User,
        as: "author",
        attributes: ["username"],
      },
    });

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found." });
    }

    res.status(200).json({ success: true, article });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const updateModerationNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { moderationNotes } = req.body;

    const article = await db.Article.findOne({ where: { id } });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    article.moderationNotes = moderationNotes;
    await article.save();

    res.status(200).json({
      success: true,
      message: "Moderation notes updated successfully",
      article,
    });
  } catch (error) {
    logger.error("Error updating moderation notes:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
