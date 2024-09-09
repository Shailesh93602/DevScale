import express from "express";
import {
  getProfile,
  getUserProgress,
  insertProfile,
  updateProfile,
} from "../controllers/userControllers.js";
import { userInsertionValidator } from "../validators/userValidators.js";
import uploadToCloudinary from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", getProfile);
router.post("/register", userInsertionValidator, insertProfile);
router.put("/update", uploadToCloudinary, updateProfile);
router.get("/progress", getUserProgress);

export default router;
