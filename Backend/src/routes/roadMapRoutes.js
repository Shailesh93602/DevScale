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

router.get("/", getAllRoadmaps);
router.get("/:id", getRoadMap);
router.get("/:id/mainConcepts", getMainConceptsInRoadmap);
router.post("/create", createRoadMap);
router.put("/update/:id", updateRoadMap);
router.delete("/delete/:id", deleteRoadMap);

export default router;
