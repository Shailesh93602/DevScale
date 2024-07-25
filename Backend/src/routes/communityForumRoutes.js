import express from "express";
import {
  createForum,
  deleteForum,
  getForum,
  getForums,
  updateForum,
} from "../controllers/communityForumControllers.js";

const router = express.Router();

// Route to get all forums
router.get("/", getForums);

// Route to get a specific forum by ID
router.get("/:id", getForum);

// Route to create a new forum
router.post("/create", createForum);

// Route to update a specific forum by ID
router.put("/update/:id", updateForum);

// Route to delete a specific forum by ID
router.delete("/delete/:id", deleteForum);

export default router;
