import { logger } from "../helpers/logger.js";

export const getResources = async (req, res) => {
  try {
  } catch (error) {
    logger.error("Error in getResources:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getBooks = async (req, res) => {
  try {
  } catch (error) {
    logger.error("Error in getBooks:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
