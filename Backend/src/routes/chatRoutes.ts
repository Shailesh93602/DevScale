import express from 'express';
import {
  createChat,
  createMessage,
  deleteChat,
  getChat,
  getChats,
} from '../controllers/chatControllers.js';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  validateChatCreation,
  validateMessageCreation,
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getChats);
router.get('/:id', authMiddleware, getChat);
router.post('/create', authMiddleware, validateChatCreation, createChat);
router.post(
  '/message/:id',
  authMiddleware,
  validateMessageCreation,
  createMessage
);
router.delete('/delete/:id', authMiddleware, deleteChat);

export default router;
