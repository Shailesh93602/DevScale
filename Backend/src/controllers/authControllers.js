import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  getAllUsersFromDB,
  updateUserPassword,
} from "../models/userModel.js";
import { validationResult } from "express-validator";
import { config } from "dotenv";
import { logger } from "../helpers/logger.js";
import validator from "email-validator";
import { findUserInfoByUserId } from "../models/userInfoModels.js";

config();

const checkUserDetailsFilled = async (id) => {
  try {
    findUserInfoByUserId(id, (err, userInfo) => {
      if (err) {
        logger.error("Error checking user details:", err);
        return false;
      }
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
    });
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
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(301).json({
        success: false,
        message: "Invalid Payload",
        errors: errors.array(),
      });
    }

    const { username, email } = req.body;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    findUserByEmail(email, async (err, useris) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });

      if (useris) {
        return res.status(401).json({
          success: false,
          message: "User already exists",
        });
      }

      const newUser = [username, email, hashedPassword];
      createUser(newUser, (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });

        res
          .status(201)
          .json({ success: true, message: "Registered Successfully!" });
      });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    console.log('hi');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(301)
        .json({ success: false, message: "Invalid Payload" });
    }
    const { username, password } = req.body;
    const isEmail = validator.validate(username);

    let user;
    if (isEmail) {
      findUserByEmail(username, async (err, result) => {
        if (err || !result)
          return res.status(404).json({
            success: false,
            message: "Incorrect username or password",
          });

        user = result;
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: "Incorrect username or password",
          });
        }

        const token = jwt.sign(
          { email: user.email },
          process.env.ACCESS_TOKEN_SECRET
        );
        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        const userDetailsFilled = await checkUserDetailsFilled(user.id);
        const route = userDetailsFilled ? "/dashboard" : "/u/details";
        res.status(200).json({
          success: true,
          message: "Logged in successfully!",
          route,
          token,
          domain:
            process.env.NODE_ENV === "production"
              ? "mrengineers.vercel.app"
              : "localhost",
        });
      });
    } else {
      findUserByUsername(username, async (err, result) => {
        if (err || !result)
          return res.status(404).json({
            success: false,
            message: "Incorrect username or password",
          });

        user = result;
        console.log(result);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: "Incorrect username or password",
          });
        }

        const token = jwt.sign(
          { email: user.email },
          process.env.ACCESS_TOKEN_SECRET
        );
        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });

        const userDetailsFilled = await checkUserDetailsFilled(user.id);
        const route = userDetailsFilled ? "/dashboard" : "/u/details";
        res.status(200).json({
          success: true,
          message: "Logged in successfully!",
          route: "/dashboard",
          token,
        });
      });
    }
  } catch (error) {
    logger.error(error);
    console.log(error);
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
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(301)
        .json({ success: false, message: "Invalid Payload" });
    }
    const { email } = req.body;

    findUserByEmail(email, async (err, user) => {
      if (err || !user)
        return res
          .status(400)
          .json({ success: false, message: "Cannot find user" });

      const resetToken = jwt.sign({ email }, process.env.RESET_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      const resetLink = `localhost:3000/resetPassword?token=${resetToken}`;
      await sendResetEmail(email, resetLink);

      res.status(200).json({
        success: true,
        message: "Password reset link sent to your email",
      });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(301)
        .json({ success: false, message: "Invalid Payload" });
    }
    const { token, password } = req.body;

    jwt.verify(token, process.env.RESET_TOKEN_SECRET, async (err, decoded) => {
      if (err)
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });

      const { email } = decoded;
      findUserByEmail(email, async (err, user) => {
        if (err || !user)
          return res
            .status(400)
            .json({ success: false, message: "User not found" });

        const hashedPassword = await bcrypt.hash(password, 10);
        updateUserPassword(email, hashedPassword, (err, result) => {
          if (err)
            return res
              .status(500)
              .json({ success: false, message: "Internal Server Error" });

          res
            .status(200)
            .json({ success: true, message: "Password updated successfully" });
        });
      });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    getAllUsersFromDB((err, users) => {
      if (err) {
        logger.error(err);
        return res.status(500).json({
          success: false,
          message: "Internal Server Error"
        });
      }

      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users
      });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
