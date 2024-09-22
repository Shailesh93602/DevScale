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
import paginationMiddleware from "../middlewares/paginationMiddleware.js";

const router = express.Router();

router.get("/", paginationMiddleware, getResources);
router.get("/:id", getResource);
router.post("/create-subject", createSubjects);
router.post("/delete-subjects", deleteSubjects);
router.get("/details/:id", getResourceDetails);
router.post("/create", createResource);
router.post("/save/:id", saveResource);

export default router;
