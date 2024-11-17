import { logger } from "../helpers/logger.js";
import Chat from "../../db/models/chat.model.js";

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.findAll({
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json({ success: true, chats });
  } catch (error) {
    logger.error("Error fetching chats:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }
    res.status(200).json({ success: true, chat });
  } catch (error) {
    logger.error("Error fetching chat:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createChat = async (req, res) => {
  try {
    const { participants } = req.body;
    if (!participants || participants.length < 2) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });
    }

    const newChat = await Chat.create({ participants });
    res.status(201).json({
      success: true,
      message: "Chat created successfully!",
      chat: newChat,
    });
  } catch (error) {
    logger.error("Error creating chat:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createMessage = async (req, res) => {
  try {
    const chatId = req.params.id;
    const { message, sender } = req.body;
    if (!message || !sender) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });
    }

    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    chat.messages.push({ message, sender });
    await chat.save();

    res
      .status(201)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    logger.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    await chat.destroy();
    res
      .status(200)
      .json({ success: true, message: "Chat deleted successfully!" });
  } catch (error) {
    logger.error("Error deleting chat:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
