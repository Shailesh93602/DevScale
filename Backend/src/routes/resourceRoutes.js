import express from "express";
import {
  createResource,
  getInterviewquestions,
  getResource,
  getResourceDetails,
  getResources,
} from "../controllers/resourceController.js";

const router = express.Router();

router.get("/", getResources);
router.get("/:id", getResource);
router.get("/interviewquestions", getInterviewquestions);
// router.get("/list", getResourceList);
router.get("/details/:id", getResourceDetails);
router.post("/create", createResource);

export default router;
