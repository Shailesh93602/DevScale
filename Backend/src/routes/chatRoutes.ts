import express from 'express';
import {
  createChat,
  createMessage,
  deleteChat,
  getChat,
  getChats,
} from '../controllers/chatControllers.js';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createChatValidationSchema,
  messageValidationSchema,
} from '../validations/chatValidations.js';

const router = express.Router();

router.get('/', authMiddleware, getChats);
router.get('/:id', authMiddleware, getChat);
router.post(
  '/create',
  authMiddleware,
  validateRequest(createChatValidationSchema),
  createChat
);
router.post(
  '/message/:id',
  authMiddleware,
  validateRequest(messageValidationSchema),
  createMessage
);
router.delete('/delete/:id', authMiddleware, deleteChat);

export default router;
