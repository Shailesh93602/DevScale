import { logger } from "../helpers/logger.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import Resource from "../models/resourceModel.js";
import Article from "../models/articleModel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getResources = (req, res) => {
  const resourcesPath = path.join(__dirname, "../../resources/resources.json");

  fs.readFile(resourcesPath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file: ${resourcesPath}`, err);
      return res
        .status(500)
        .json({ success: false, message: "Error reading resources file" });
    }
    try {
      const resources = JSON.parse(data);
      res.status(200).json({ success: true, resources });
    } catch (parseError) {
      console.error(`Error parsing JSON: ${resourcesPath}`, parseError);
      res
        .status(500)
        .json({ success: false, message: "Error parsing resources file" });
    }
  });
};
export const getResource = (req, res) => {
  try {
    const id = req.params.id;
    const resourcesPath = path.join(__dirname, `../../resources/${id}.json`);
    fs.readFile(resourcesPath, "utf8", (err, data) => {
      if (err) {
        logger.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
      const resource = JSON.parse(data);
      res.status(200).json({ success: true, resource });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getResourceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

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
    console.error("Error fetching resource details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const getResourcesList = (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createResource = async (req, res) => {
  try {
    const { subject, topic, subtopic, content } = req.body;

    if (!subject || !topic || !content) {
      return res.status(400).json({
        success: false,
        message: "Subject, topic, and content are required.",
      });
    }

    const newResource = new Resource({ subject, topic, subtopic, content });

    await newResource.save();

    res.status(201).json({ success: true, resource: newResource });
  } catch (error) {
    console.error("Error saving resource:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save resource" });
  }
};

export const getInterviewquestions = async (req, res) => {
  const interviewquestionsPath = path.join(
    __dirname,
    `../../resources/interviewquestions.json`
  );

  fs.readFile(interviewquestionsPath, "utf-8", (err, data) => {
    if (err) {
      console.error(`Error reading file : ${err.interviewquestionsPath}`, err);
      return res
        .status(500)
        .json({ success: false, message: "Error reading resource file" });
    }
    try {
      const interviewquestions = JSON.parse(data);
      res.status(200).json({ success: true, interviewquestions });
    } catch (parseError) {
      console.error(`Error parsing JSON: ${resourcesPath}`, parseError);
      res
        .status(500)
        .json({ success: false, message: "Error parsing resources file" });
    }
  });
};

export const createArticle = async (req, res) => {
  const { title, content, author, topicId } = req.body;

  try {
    const article = new Article({
      title,
      content,
      author,
      topic: topicId,
    });

    await article.save();

    const resource = await Resource.findById(topicId);
    resource.articles.push(article._id);
    await resource.save();

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

export const getArticle = async (req, res) => {
  try {
    const articles = await Article.find({ topic: req.params.id });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

export const selectArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ msg: "Article not found" });
    }

    article.isSelected = true;
    await article.save();

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
