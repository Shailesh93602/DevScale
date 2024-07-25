import { logger } from "../helpers/logger.js";
import { getAllResources, getAllBooks } from "../models/placementModel.js";

export const getResources = async (req, res) => {
  try {
    const resources = await getAllResources();
    res.status(200).json({ success: true, resources });
  } catch (error) {
    logger.error("Error in getResources:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getBooks = async (req, res) => {
  try {
    const books = await getAllBooks();
    res.status(200).json({ success: true, books });
  } catch (error) {
    logger.error("Error in getBooks:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
