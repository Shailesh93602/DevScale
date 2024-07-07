import express from "express";
import {
  getResource,
  getResources,
} from "../controllers/resourceController.js";

const router = express.Router();

router.get("/", getResources);
router.get("/:id", getResource);

export default router;
