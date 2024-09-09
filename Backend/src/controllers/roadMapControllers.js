import { logger } from "../helpers/logger.js";
import db from "../../db/models/index.js";

export const getAllRoadmaps = async (req, res) => {
  try {
    const roadmaps = await db.RoadMap.findAll({
      include: [
        {
          model: db.MainConcept,
          attributes: ["id", "name", "description"],
        },
      ],
    });
    res.status(200).json(roadmaps);
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMainConceptsInRoadmap = async (req, res) => {
  const { roadmapId } = req.params;
  try {
    const roadmap = await db.RoadMap.findByPk(roadmapId, {
      include: [
        {
          model: db.MainConcept,
          attributes: ["id", "name", "description"],
          include: [
            {
              model: db.Subject,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });
    if (roadmap) {
      res.status(200).json(roadmap.MainConcepts);
    } else {
      res.status(404).json({ message: "Roadmap not found" });
    }
  } catch (error) {
    console.error("Error fetching main concepts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoadMap = async (req, res) => {
  try {
    const roadMapId = req.params.id;
    const roadMap = await RoadMap.findByPk(roadMapId);

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
