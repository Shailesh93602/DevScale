import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '@/utils/apiResponse';
import { createAppError } from '@/utils/errorHandler';
import ChatRepository from '@/repositories/chatRepository';

export default class ChatController {
  private readonly chatRepo: ChatRepository;

  constructor() {
    this.chatRepo = new ChatRepository();
  }
  public getChats = catchAsync(async (req: Request, res: Response) => {
    const chats = await this.chatRepo.findMany({
      orderBy: { created_at: 'asc' },
    });
    sendResponse(res, 'CHATS_FETCHED', { data: chats });
  });

  public getChat = catchAsync(async (req: Request, res: Response) => {
    const chatId = req.params.id;
    const chat = await this.chatRepo.findUnique({
      where: { id: chatId },
    });
    if (!chat) {
      throw createAppError('Chat not found', 404);
    }

    sendResponse(res, 'CHATS_FETCHED', { data: chat });
  });

  public createChat = catchAsync(async (req: Request, res: Response) => {
    const { participants } = req.body;
    if (!participants || participants.length < 2) {
      throw createAppError('Invalid payload', 400);
    }

    // TODO: implement this method

    const newChat = await this.chatRepo.create({
      data: {
        message: '',
        user1: { connect: { id: participants[0] } },
        user2: { connect: { id: participants[1] } },
      },
    });
    sendResponse(res, 'CHAT_CREATED', { data: newChat });
  });

  public createMessage = catchAsync(async (req: Request, res: Response) => {
    const chatId = req.params.id;
    const { message, sender } = req.body;
    if (!message || !sender) {
      throw createAppError('Invalid payload', 400);
    }

    const chat = await this.chatRepo.findUnique({
      where: { id: chatId },
    });
    if (!chat) {
      throw createAppError('Chat not found', 404);
    }

    // await this.chatRepo.update({
    //   where: { id: chatId },
    //   data: {
    //     messages: {
    //       push: { message, sender },
    //     },
    //   },
    // });
    sendResponse(res, 'CHAT_MESSAGE_SENT');
  });

  public deleteChat = catchAsync(async (req: Request, res: Response) => {
    const chatId = req.params.id;
    const chat = await this.chatRepo.findUnique({
      where: { id: chatId },
    });
    if (!chat) {
      throw createAppError('Chat not found', 404);
    }

    await this.chatRepo.delete({
      where: { id: chatId },
    });

    sendResponse(res, 'CHAT_DELETED');
  });
}
