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

// Route to get all resources
router.get("/", getResources);

// Route to get a specific resource by ID
router.get("/:id", getResource);

// Route to get all interview questions

router.post("/create-subject", createSubjects);

router.post("/delete-subjects", deleteSubjects);
// router.get("/interviewquestions", getInterviewquestions);

// Route to get resource details by ID
router.get("/details/:id", getResourceDetails);

// Route to create a new resource
router.post("/create", createResource);

router.post("/save/:id", saveResource);

export default router;
