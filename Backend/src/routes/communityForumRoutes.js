import express from "express";
import {
  createForum,
  deleteForum,
  getForum,
  getForums,
  updateForum,
} from "../controllers/communityForumControllers.js";

const router = express.Router();

router.get("/", getForums);
router.get("/:id", getForum);
router.post("/create", createForum);
router.put("/update/:id", updateForum);
router.delete("/delete/:id", deleteForum);

export default router;
