import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { getUsersCollection } from '../models/userModels.js';

config();
const sendResetEmail = async(email, resetLink) => {
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
}

export const register = async (req, res) => {
  try {
    // const { firstName, lastName, dob, gender, email, phoneNumber, password, address, city, state, country, zipCode  } = req.body;
    const { email, password } = req.body;

    if(!email || !password) res.status(300).json({ success: false, message: "Invalid payload"});
    const usersCollection = getUsersCollection();
    let isUserExists = usersCollection.findOne({ email });
    if(isUserExists) res.status(500).json({ success: false, message: "User already exits!"});
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { email, password: hashedPassword };
    await usersCollection.insertOne(user);
    res.status(201).json({ success: true, message: "Registered Successfully!"});
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usersCollection = getUsersCollection();
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Incorrect username or password'});

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Incorrect username or password' });
    
    const accessToken = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET);
    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send();
  }
}

export const forgotPassword = async(req, res) => {
  try {
    const { email } = req.body;
    const usersCollection = getUsersCollection();
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Cannot find user'});
    
    const resetToken = jwt.sign({ email }, process.env.RESET_TOKEN_SECRET, { expiresIn: '1h' });

    const resetLink = `localhost:3000/resetPassword?token=${resetToken}`;
    await sendResetEmail(email, resetLink);

    res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error logging in:', error);
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
      const usersCollection = getUsersCollection();
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await usersCollection.updateOne({ email }, { $set: { password: hashedPassword } });

      res.status(200).json({ success: true, message: 'Password updated successfully' });
    });
  } catch (error) {
    console.error('Error resetting password:', error);
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
    console.error('Error logging out:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}