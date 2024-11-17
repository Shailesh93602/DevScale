import express from "express";
import {
  deleteUserRoadmap,
  getProfile,
  getUserProgress,
  getUserRoadmap,
  insertProfile,
  insertUserRoadmap,
  updateProfile,
} from "../controllers/userControllers.js";
import { userInsertionValidator } from "../validators/userValidators.js";
import uploadToCloudinary from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", getProfile);
router.post("/register", userInsertionValidator, insertProfile);
router.put("/update", uploadToCloudinary, updateProfile);
router.get("/progress", getUserProgress);
router.get("/roadmap", getUserRoadmap);
router.post("/roadmap", insertUserRoadmap);
router.delete("/roadmap/:id", deleteUserRoadmap);

export default router;
