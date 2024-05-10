import express from 'express';
import { createChat, createMessage, deleteChat, getChat, getChats } from '../controllers/chatControllers.js';

const router = express.Router();

router.get('/', getChats);
router.get('/:id', getChat);
router.post('/create', createChat);
router.post('/message/:id', createMessage);
router.delete('/delete/:id', deleteChat);

export default router;
