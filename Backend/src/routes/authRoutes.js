import express from 'express';
import { register, login, forgotPassword, resetPassword, logout } from '../controllers/authControllers.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);
router.post('/logout', logout);

export default router;
