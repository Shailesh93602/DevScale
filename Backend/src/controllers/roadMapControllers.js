import { logger } from "../helpers/logger.js"; // Import logger

// Get all roadmaps
export const getRoadMaps = async (req, res) => {
  try {
    const roadMaps = await RoadMap.findAll(); // Fetch all roadmaps
    res.status(200).json({ success: true, roadMaps });
  } catch (error) {
    logger.error("Error fetching roadmaps:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get a single roadmap by ID
export const getRoadMap = async (req, res) => {
  try {
    const roadMapId = req.params.id;
    const roadMap = await RoadMap.findByPk(roadMapId); // Fetch roadmap by ID

    if (!roadMap) {
      return res
        .status(404)
        .json({ success: false, message: "Roadmap not found" });
    }

    res.status(200).json({ success: true, roadMap });
  } catch (error) {
    logger.error("Error fetching roadmap:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Create a new roadmap
export const createRoadMap = async (req, res) => {
  try {
    const { title, description, content } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and content are required",
      });
    }

    const newRoadMap = await RoadMap.create({ title, description, content });
    res.status(201).json({ success: true, roadMap: newRoadMap });
  } catch (error) {
    logger.error("Error creating roadmap:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update an existing roadmap
export const updateRoadMap = async (req, res) => {
  try {
    const roadMapId = req.params.id;
    const { title, description, content } = req.body;

    const roadMap = await RoadMap.findByPk(roadMapId);

    if (!roadMap) {
      return res
        .status(404)
        .json({ success: false, message: "Roadmap not found" });
    }

    // Update fields only if provided
    roadMap.title = title !== undefined ? title : roadMap.title;
    roadMap.description =
      description !== undefined ? description : roadMap.description;
    roadMap.content = content !== undefined ? content : roadMap.content;
    await roadMap.save();

    res.status(200).json({ success: true, roadMap });
  } catch (error) {
    logger.error("Error updating roadmap:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete a roadmap
export const deleteRoadMap = async (req, res) => {
  try {
    const roadMapId = req.params.id;

    const roadMap = await RoadMap.findByPk(roadMapId);

    if (!roadMap) {
      return res
        .status(404)
        .json({ success: false, message: "Roadmap not found" });
    }

    await roadMap.destroy();
    res
      .status(200)
      .json({ success: true, message: "Roadmap deleted successfully" });
  } catch (error) {
    logger.error("Error deleting roadmap:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
