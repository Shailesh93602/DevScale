import express from "express";
import {
  getProfile,
  insertProfile,
  updateProfile,
} from "../controllers/userControllers.js";
import { userInsertionValidator } from "../validators/userValidators.js";
import uploadToCloudinary from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Route to get the user's profile
router.get("/", getProfile);

// Route to register a new user profile
router.post("/register", userInsertionValidator, insertProfile);

// Route to update an existing user profile
router.put("/update", uploadToCloudinary, updateProfile);

export default router;
