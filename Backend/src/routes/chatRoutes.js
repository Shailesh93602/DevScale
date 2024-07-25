import express from "express";
import {
  createChat,
  createMessage,
  deleteChat,
  getChat,
  getChats,
} from "../controllers/chatControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  validateChatCreation,
  validateMessageCreation,
} from "../middlewares/validationMiddleware.js"; // Import validation middleware if needed

const router = express.Router();

// Route to get all chats
router.get("/", authMiddleware, getChats);

// Route to get a specific chat by ID
router.get("/:id", authMiddleware, getChat);

// Route to create a new chat
router.post("/create", authMiddleware, validateChatCreation, createChat);

// Route to create a new message in a specific chat
router.post(
  "/message/:id",
  authMiddleware,
  validateMessageCreation,
  createMessage
);

// Route to delete a specific chat by ID
router.delete("/delete/:id", authMiddleware, deleteChat);

export default router;
