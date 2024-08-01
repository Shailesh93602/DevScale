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

// Get all subjects
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.status(200).json({ success: true, subjects });
  } catch (err) {
    logger.error("Error fetching subjects:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get topics by subject ID
export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.findAll({ where: { subjectId: req.params.id } });
    res.status(200).json({ success: true, topics });
  } catch (err) {
    logger.error("Error fetching topics:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Add a new topic
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

// Function to get resources (subjects) from the database
export const getResources = async (req, res) => {
  try {
    // Fetch all subjects from the database
    const subjects = await db.Subject.findAll({
      attributes: ["id", "name", "description"], // Specify the fields you want to retrieve
    });

    // Send the retrieved subjects as the response
    res.status(200).json({ success: true, resources: subjects });
  } catch (error) {
    // Log and handle any errors that occur during the process
    logger.error("Error fetching subjects from database:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subjects from database",
    });
  }
};

// Get a specific resource by Subject ID
export const getResource = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the subject by ID
    const subject = await db.Subject.findByPk(id);

    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    // Fetch the topics related to the subject
    const topics = await db.Topic.findAll({
      where: { subjectId: id },
      include: [
        {
          model: db.Article,
          attributes: ["id", "title", "content", "status"],
          where: { status: "approved" }, // Only include approved articles
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

// Get details of a specific resource
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

// Create a new resource
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

// Get interview questions from a file
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

// Create a new article
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

// Get articles by topic ID
export const getArticle = async (req, res) => {
  try {
    const articles = await Article.find({ topic: req.params.id });
    res.status(200).json({ success: true, articles });
  } catch (err) {
    logger.error("Error fetching articles:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Select an article
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

// Controller function to save a new resource
export const saveResource = async (req, res) => {
  console.log(req.params, req.body);
  const { id } = req.params;
  const { content, subtopic } = req.body;

  try {
    const topic = await db.Topic.findByPk(id);

    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: "Topic not found." });
    }

    const article = await db.Article.create({
      title: `${topic.name} - ${subtopic || "General"}`,
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
    console.log(
      "🚀 ~ file: resourceController.js:261 ~ saveResource ~ error:",
      error
    );
    logger.error("Error saving resource:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
