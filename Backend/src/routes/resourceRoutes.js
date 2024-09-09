import express from "express";
import {
  createResource,
  createSubjects,
  deleteSubjects,
  getResource,
  getResourceDetails,
  getResources,
  saveResource,
} from "../controllers/resourceController.js";

const router = express.Router();

router.get("/", getResources);
router.get("/:id", getResource);
router.post("/create-subject", createSubjects);
router.post("/delete-subjects", deleteSubjects);
router.get("/details/:id", getResourceDetails);
router.post("/create", createResource);
router.post("/save/:id", saveResource);

export default router;
