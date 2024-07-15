import { logger } from "../helpers/logger.js";
import fs from "fs";
import path from "path";
import resourceModel from "../models/resourceModel.js";

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
      console.log(resources);
      res.status(200).json({ success: true, resources });
    });
  } catch (error) {
    console.log(error);
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

export const createResource = async (req, res) => {
  try {
    const { content } = req.body;
    console.log(req.body);
    const newResource = new resourceModel({ content });
    await newResource.save();
    res.status(201).json(newResource);
  } catch (error) {
    console.error("Error saving resource:", error);
    res.status(500).json({ error: "Failed to save resource" });
  }
};
