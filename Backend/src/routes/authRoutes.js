import express from "express";
import {
  insertProfile,
  getProfile,
  updateProfile,
} from "../controllers/profileController.js"; // Import profile controllers
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { login, logout, register } from "../controllers/authController.js";

const router = express.Router();

// Register a new user
router.post("/register", register);

// Login a user
router.post("/login", login);

// Logout a user
router.post("/logout", authMiddleware, logout);

// Refresh token
// router.post("/refresh-token", refreshToken);

// Insert profile
router.post("/profile", authMiddleware, insertProfile);

// Get profile
router.get("/profile", authMiddleware, getProfile);

// Update profile
router.put("/profile", authMiddleware, updateProfile);

export default router;
