import express from 'express';
import {
  createChat,
  createMessage,
  deleteChat,
  getChat,
  getChats,
} from '../controllers/chatControllers.js';
import { authenticateUser } from '../middlewares/authMiddleware';
import {
  validateChatCreation,
  validateMessageCreation,
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.get('/', authenticateUser, getChats);
router.get('/:id', authenticateUser, getChat);
router.post('/create', authenticateUser, validateChatCreation, createChat);
router.post(
  '/message/:id',
  authenticateUser,
  validateMessageCreation,
  createMessage
);
router.delete('/delete/:id', authenticateUser, deleteChat);

export default router;
