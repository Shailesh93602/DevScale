import { logger } from "../helpers/logger.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import Resource from "../../db/models/resource.model.js";
import Article from "../../db/models/article.model.js";
import Subject from "../../db/models/subject.model.js";
import Topic from "../../db/models/topic.model.js";
import db from "../../db/models/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.status(200).json({ success: true, subjects });
  } catch (err) {
    logger.error("Error fetching subjects:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.findAll({ where: { subjectId: req.params.id } });
    res.status(200).json({ success: true, topics });
  } catch (err) {
    logger.error("Error fetching topics:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const addTopic = async (req, res) => {
  const { name, description, subjectId } = req.body;

  try {
    const topic = await Topic.create({ name, description, subjectId });
    res.status(201).json({ success: true, topic });
  } catch (err) {
    logger.error("Error adding topic:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getResources = async (req, res) => {
  try {
    let subjects = await db.Subject.findAll({
      attributes: {
        include: ["id", "name", "description", "tags"],
        exclude: ["baz"],
      },
    });

    subjects = subjects.map((subject) => ({
      ...subject.dataValues,
      tags: subject.dataValues?.tags?.split(","),
    }));
    res.status(200).json({ success: true, resources: subjects });
  } catch (error) {
    logger.error("Error fetching subjects from database:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subjects from database",
    });
  }
};

export const getResource = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await db.Subject.findByPk(id);

    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    const topics = await db.Topic.findAll({
      where: { subjectId: id },
      include: [
        {
          model: db.Article,
          attributes: ["id", "title", "content", "status"],
          required: false,
        },
      ],
    });

    res.status(200).json({
      success: true,
      resource: {
        subject,
        topics,
      },
    });
  } catch (error) {
    logger.error("Error retrieving resource:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createSubjects = async (req, res) => {
  try {
    const subjects = req.body;

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body should be a non-empty array of subjects.",
      });
    }

    const createdSubjects = await db.Subject.bulkCreate(subjects, {
      validate: true,
      returning: true,
    });

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdSubjects.length} subjects.`,
      subjects: createdSubjects,
    });
  } catch (error) {
    logger.error("Error creating subjects:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((e) => e.message),
      });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteSubjects = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Request body should contain a non-empty array of subject IDs.",
      });
    }

    const subjectsToDelete = await db.Subject.findAll({
      where: { id: ids },
      attributes: ["id", "name"],
    });

    const deletedCount = await db.Subject.destroy({
      where: { id: ids },
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No subjects found with the provided IDs.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedCount} subjects.`,
      deletedSubjects: subjectsToDelete,
    });
  } catch (error) {
    logger.error("Error deleting subjects:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getResourceDetails = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }

    res.status(200).json({
      success: true,
      subject: resource.subject,
      topic: resource.topic,
      subtopic: resource.subtopic,
      content: resource.content,
    });
  } catch (error) {
    logger.error("Error fetching resource details:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createResource = async (req, res) => {
  const { subject, topic, subtopic, content } = req.body;

  if (!subject || !topic || !content) {
    return res.status(400).json({
      success: false,
      message: "Subject, topic, and content are required.",
    });
  }

  try {
    const newResource = new Resource({ subject, topic, subtopic, content });
    await newResource.save();
    res.status(201).json({ success: true, resource: newResource });
  } catch (error) {
    logger.error("Error saving resource:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save resource" });
  }
};

export const getInterviewQuestions = (req, res) => {
  const interviewQuestionsPath = path.join(
    __dirname,
    "../../resources/interviewquestions.json"
  );

  fs.readFile(interviewQuestionsPath, "utf8", (err, data) => {
    if (err) {
      logger.error(
        `Error reading interview questions file: ${interviewQuestionsPath}`,
        err
      );
      return res.status(500).json({
        success: false,
        message: "Error reading interview questions file",
      });
    }
    try {
      const interviewQuestions = JSON.parse(data);
      res.status(200).json({ success: true, interviewQuestions });
    } catch (parseError) {
      logger.error(
        `Error parsing interview questions JSON: ${interviewQuestionsPath}`,
        parseError
      );
      res.status(500).json({
        success: false,
        message: "Error parsing interview questions file",
      });
    }
  });
};

export const createArticle = async (req, res) => {
  const { title, content, author, topicId } = req.body;

  try {
    const article = new Article({ title, content, author, topic: topicId });
    await article.save();

    const resource = await Resource.findById(topicId);
    if (resource) {
      resource.articles.push(article._id);
      await resource.save();
    }

    res.status(201).json({ success: true, article });
  } catch (err) {
    logger.error("Error creating article:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getArticle = async (req, res) => {
  try {
    const articles = await Article.find({ topic: req.params.id });
    res.status(200).json({ success: true, articles });
  } catch (err) {
    logger.error("Error fetching articles:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const selectArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    article.isSelected = true;
    await article.save();

    res.status(200).json({ success: true, article });
  } catch (err) {
    logger.error("Error selecting article:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const saveResource = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const topic = await db.Topic.findByPk(id);

    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: "Topic not found." });
    }

    const article = await db.Article.create({
      title: `${topic.title} - ${"General"}`,
      content,
      topicId: id,
      authorId: req.user.id,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Resource saved successfully. Pending approval.",
      data: article,
    });
  } catch (error) {
    logger.error("Error saving resource:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
