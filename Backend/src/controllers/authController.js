import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { validationResult } from "express-validator";
import { config } from "dotenv";
import validator from "email-validator";
import User from "../../db/models/user.model.js";
import UserInfo from "../../db/models/userInfo.model.js";
import { logger } from "../helpers/logger.js";

config();

const checkUserDetailsFilled = async (id) => {
  try {
    const userInfo = await UserInfo.findOne({ where: { userId: id } });
    if (
      userInfo &&
      userInfo.fullName &&
      userInfo.dob &&
      userInfo.gender &&
      userInfo.mobile &&
      userInfo.address
    ) {
      return true;
    }
    return false;
  } catch (error) {
    logger.error("Error checking user details:", error);
    return false;
  }
};

const sendResetEmail = async (email, resetLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_ADDRESS,
      to: email,
      subject: "Password Reset",
      text: `Click the following link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    logger.error(error);
  }
};

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid Payload",
      errors: errors.array(),
    });
  }

  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Registered Successfully!",
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Invalid Payload" });
  }

  const { username, password } = req.body;
  const isEmail = validator.validate(username);

  try {
    const user = isEmail
      ? await User.findOne({ where: { email: username } })
      : await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Incorrect username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect username or password",
      });
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    const userInfo = await UserInfo.findOne({ where: { userId: user.id } });

    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      route: "/dashboard",
      token,
      user: { ...user.toJSON(), ...userInfo?.toJSON() },
      domain:
        process.env.NODE_ENV === "production"
          ? "mrengineers.vercel.app"
          : "localhost",
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send();
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    res
      .status(200)
      .json({ success: true, message: "Logged out successfully!" });
  } catch (error) {
    logger.error(error);
    res.status(500).send();
  }
};

export const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Invalid Payload" });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot find user" });
    }

    const resetToken = jwt.sign({ email }, process.env.RESET_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    const resetLink = `http://localhost:3000/resetPassword?token=${resetToken}`;
    await sendResetEmail(email, resetLink);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Invalid Payload" });
  }

  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
    const { email } = decoded;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.update({ password: hashedPassword }, { where: { email } });

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
