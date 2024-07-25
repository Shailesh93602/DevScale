import express from "express";
import {
  enrollCourse,
  getCourse,
  getCourses,
} from "../controllers/courseControllers.js";

const router = express.Router();

// Route to get all courses
router.get("/", getCourses);

// Route to get a specific course by ID
router.get("/:id", getCourse);

// Route to enroll in a course
router.post("/enroll", enrollCourse);

export default router;
