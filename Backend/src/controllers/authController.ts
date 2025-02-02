import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { validationResult } from 'express-validator';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils/index';
import {
  ACCESS_TOKEN_SECRET,
  MAIL_ADDRESS,
  MAIL_PASSWORD,
  RESET_TOKEN_SECRET,
} from '../config';

config();

const prisma = new PrismaClient();

const sendResetEmail = async (
  email: string,
  resetLink: string
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: MAIL_ADDRESS,
      pass: MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: MAIL_ADDRESS,
    to: email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: ${resetLink}`,
  };

  await transporter.sendMail(mailOptions);
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Payload',
      errors: errors.array(),
    });
  }

  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User already exists',
    });
  }

  await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Registered Successfully!',
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Invalid Payload' });
  }

  const { username, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: username }, { username }],
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect email or password',
    });
  }

  const token = jwt.sign({ email: user.email }, ACCESS_TOKEN_SECRET as string, {
    expiresIn: '15d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Logged in successfully!',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully!' });
});

export const forgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Payload' });
    }

    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Cannot find user',
      });
    }

    const resetToken = jwt.sign({ email }, RESET_TOKEN_SECRET as string, {
      expiresIn: '1h',
    });

    const resetLink = `http://localhost:3000/resetPassword?token=${resetToken}`;
    await sendResetEmail(email, resetLink);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  }
);

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Invalid Payload' });
  }

  const { token, password } = req.body;

  const decoded = jwt.verify(token, RESET_TOKEN_SECRET as string) as {
    email: string;
  };

  const user = await prisma.user.findUnique({
    where: { email: decoded.email },
  });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email: decoded.email },
    data: { password: hashedPassword },
  });

  res
    .status(200)
    .json({ success: true, message: 'Password updated successfully' });
});

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
    },
    orderBy: { created_at: 'asc' },
  });

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
});
