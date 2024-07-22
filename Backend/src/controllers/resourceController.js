import { logger } from "../helpers/logger.js";
import fs from "fs";
import path from "path";
import Resource from "../models/resourceModel.js";

export const getResources = (req, res) => {
  try {
    const resourcesPath = path.join(
      import.meta.dirname,
      "../../resources/resources.json"
    );
    fs.readFile(resourcesPath, "utf8", (err, data) => {
      if (err) {
        logger.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
      const resources = JSON.parse(data);
      res.status(200).json({ success: true, resources });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getResource = (req, res) => {
  try {
    const id = req.params.id;
    const resourcesPath = path.join(
      import.meta.dirname,
      `../../resources/${id}.json`
    );
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
