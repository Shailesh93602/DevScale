import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';

const prisma = new PrismaClient();

// TODO: implement this feature

export const getChats = catchAsync(async (req: Request, res: Response) => {
  const chats = await prisma.chat.findMany({
    orderBy: { created_at: 'asc' },
  });
  res.status(200).json({ success: true, chats });
});

export const getChat = catchAsync(async (req: Request, res: Response) => {
  const chatId = req.params.id;
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });
  if (!chat) {
    return res.status(404).json({ success: false, message: 'Chat not found' });
  }
  res.status(200).json({ success: true, chat });
});

export const createChat = catchAsync(async (req: Request, res: Response) => {
  const { participants } = req.body;
  if (!participants || participants.length < 2) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  // TODO: implement this method

  // const newChat = await prisma.chat.create({
  // data: { user2Id: participants },
  // });
  res.status(201).json({
    success: true,
    message: 'Chat created successfully!',
    // chat: newChat,
  });
});

export const createMessage = catchAsync(async (req: Request, res: Response) => {
  const chatId = req.params.id;
  const { message, sender } = req.body;
  if (!message || !sender) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });
  if (!chat) {
    return res.status(404).json({ success: false, message: 'Chat not found' });
  }

  // await prisma.chat.update({
  //   where: { id: chatId },
  //   data: {
  //     messages: {
  //       push: { message, sender },
  //     },
  //   },
  // });

  res
    .status(201)
    .json({ success: true, message: 'Message sent successfully!' });
});

export const deleteChat = catchAsync(async (req: Request, res: Response) => {
  const chatId = req.params.id;
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });
  if (!chat) {
    return res.status(404).json({ success: false, message: 'Chat not found' });
  }

  await prisma.chat.delete({
    where: { id: chatId },
  });
  res
    .status(200)
    .json({ success: true, message: 'Chat deleted successfully!' });
});
