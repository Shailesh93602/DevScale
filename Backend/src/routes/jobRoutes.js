import express from "express";
import {
  createJob,
  deleteJob,
  getJob,
  getJobs,
  updateJob,
} from "../controllers/jobControllers.js";

const router = express.Router();

// Route to get a list of all jobs
router.get("/", getJobs);

// Route to get details of a specific job by ID
router.get("/:id", getJob);

// Route to create a new job
router.post("/create", createJob);

// Route to update a specific job by ID
router.put("/update/:id", updateJob);

// Route to delete a specific job by ID
router.delete("/delete/:id", deleteJob);

export default router;
