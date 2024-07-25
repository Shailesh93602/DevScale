import express from "express";
import {
  createResource,
  getResource,
  getResourceDetails,
  getResources,
} from "../controllers/resourceController.js";

const router = express.Router();

// Route to get all resources
router.get("/", getResources);

// Route to get a specific resource by ID
router.get("/:id", getResource);

// Route to get all interview questions
router.get("/interviewquestions", getInterviewquestions);

// Route to get resource details by ID
router.get("/details/:id", getResourceDetails);

// Route to create a new resource
router.post("/create", createResource);

export default router;
