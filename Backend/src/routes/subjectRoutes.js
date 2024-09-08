import express from "express";
import {
  getAllSubjects,
  getTopicsInSubject,
} from "../controllers/subjectController.js";

const router = express.Router();

router.get("/", getAllSubjects);
router.get("/:id/topics", getTopicsInSubject);

export default router;
