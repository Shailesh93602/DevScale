import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/userModels.js';
import { logger } from '../helpers/logger.js';
import validator from "email-validator";

config();
const sendResetEmail = async (email, resetLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.MAIL_ADDRESS,
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: ${resetLink}`
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    logger.error(error);
  }
}

export const register = async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email || !req.body.password) res.status(300).json({ success: false, message: "Invalid payload" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    const result = await user.save();
    const { password, ...data } = await result.toJSON();
    res.status(201).json({ success: true, message: "Registered Successfully!" });
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const login = async (req, res) => {
  try {
    console.log("Here");
    console.log(req.body);
    const { username, password } = req.body;

    const isEmail = validator.validate(username);

    let user;
    if (isEmail) user = await User.findOne({ email: username });
    else user = await User.findOne({ username });

    if (!user) res.status(404).json({ success: false, message: "Incorrect username of password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Incorrect username or password' });

    const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({ success: true, message: "Logged in successfully!" });
  } catch (error) {
    logger.error(error);
    res.status(500).send();
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Cannot find user' });

    const resetToken = jwt.sign({ email }, process.env.RESET_TOKEN_SECRET, { expiresIn: '1h' });

    const resetLink = `localhost:3000/resetPassword?token=${resetToken}`;
    await sendResetEmail(email, resetLink);

    res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    logger.error('Error logging in:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and newPassword are required' });
    }

    jwt.verify(token, process.env.RESET_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
      }

      const { email } = decoded;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.updateOne({ email }, { $set: { password: hashedPassword } });

      res.status(200).json({ success: true, message: 'Password updated successfully' });
    });
  } catch (error) {
    logger.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error logging out:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
  } catch (error) {
    logger.error('Error logging out:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}