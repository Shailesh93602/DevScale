import express from "express";
import { getSubjectsInMainConcept } from "../controllers/mainConceptController.js";

const router = express.Router();

router.get("/:id/subjects", getSubjectsInMainConcept);

export default router;
