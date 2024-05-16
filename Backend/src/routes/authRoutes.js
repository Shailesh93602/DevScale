import express from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authControllers.js';
import { forgotPasswordValidator, loginValidator, registerValidator, resetPasswordValidator } from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/forgotPassword', forgotPasswordValidator, forgotPassword);
router.post('/resetPassword', resetPasswordValidator, resetPassword);

export default router;
