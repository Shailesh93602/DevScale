import express from "express";
import {
  createResource,
  getResource,
  getResources,
} from "../controllers/resourceController.js";

const router = express.Router();

router.get("/", getResources);
router.get("/:id", getResource);
router.post("/create", createResource);

export default router;
