import express from 'express';
import { register, login, forgotPassword, resetPassword, logout, getAllUsers } from '../controllers/authControllers.js';
import { forgotPasswordValidator, loginValidator, registerValidator, resetPasswordValidator } from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', logout);
router.post('/forgotPassword', forgotPasswordValidator, forgotPassword);
router.post('/resetPassword', resetPasswordValidator, resetPassword);
router.get('/users', getAllUsers)

export default router;
