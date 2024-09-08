import express from "express";
import {
  createRoadMap,
  deleteRoadMap,
  getAllRoadmaps,
  getMainConceptsInRoadmap,
  getRoadMap,
  updateRoadMap,
} from "../controllers/roadMapControllers.js";

const router = express.Router();

// Route to get all roadmaps
router.get("/", getAllRoadmaps);

// Route to get a specific roadmap by ID
router.get("/:id", getRoadMap);

router.get("/:id/mainConcepts", getMainConceptsInRoadmap);

// Route to create a new roadmap
router.post("/create", createRoadMap);

// Route to update an existing roadmap by ID
router.put("/update/:id", updateRoadMap);

// Route to delete a roadmap by ID
router.delete("/delete/:id", deleteRoadMap);

export default router;
