import { logger } from "../helpers/logger.js";
import Chat from "../models/chatModel.js"; // Ensure this is your Sequelize model for Chat

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.findAll(); // Fetch all chats using Sequelize
    res.status(200).json({ success: true, chats });
  } catch (error) {
    logger.error("Error fetching chats:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    const chat = await Chat.findByPk(chatId); // Fetch chat by primary key using Sequelize
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

    // Create a new chat using Sequelize
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

    // Fetch chat by primary key
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    // Assuming Chat model has a messages field or similar
    chat.messages.push({ message, sender });
    await chat.save(); // Save updated chat

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

    await chat.destroy(); // Delete chat using Sequelize
    res
      .status(200)
      .json({ success: true, message: "Chat deleted successfully!" });
  } catch (error) {
    logger.error("Error deleting chat:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
