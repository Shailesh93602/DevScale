import { logger } from "../helpers/logger.js";
import fs from "fs";
import path from "path";

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
