import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import { createAppError } from '../utils/errorHandler';
import ChatRepository from '../repositories/chatRepository';

/** Only chats the caller is part of; anything else is reported as not found. */
const mine = (userId: string) => ({
  OR: [{ user1_id: userId }, { user2_id: userId }],
});

export default class ChatController {
  private readonly chatRepo: ChatRepository;

  constructor() {
    this.chatRepo = new ChatRepository();
  }

  private findOwnChat(chatId: string, userId: string) {
    return this.chatRepo.findFirst({ where: { id: chatId, ...mine(userId) } });
  }

  public getChats = catchAsync(async (req: Request, res: Response) => {
    const limit = Math.min(
      100,
      Math.max(1, Math.floor(Number(req.query.limit)) || 50)
    );
    const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
    const chats = await this.chatRepo.findMany({
      where: mine(req.user.id),
      orderBy: { created_at: 'asc' },
      take: limit,
      skip: (page - 1) * limit,
    });
    sendResponse(res, 'CHATS_FETCHED', { data: chats });
  });

  public getChat = catchAsync(async (req: Request, res: Response) => {
    const chat = await this.findOwnChat(req.params.id, req.user.id);
    if (!chat) {
      throw createAppError('Chat not found', 404);
    }

    sendResponse(res, 'CHATS_FETCHED', { data: chat });
  });

  public createChat = catchAsync(async (req: Request, res: Response) => {
    const { participants, message } = req.body;
    if (!participants || participants.length < 2) {
      throw createAppError('Invalid payload', 400);
    }
    // The caller is always one side of the chat; nobody can open a chat on
    // behalf of two other people.
    const me = req.user.id;
    const other = (participants as string[]).find((id) => id !== me);
    if (!participants.includes(me) || !other) {
      throw createAppError('Invalid payload', 400);
    }

    const newChat = await this.chatRepo.create({
      data: {
        message: message || '',
        user1: { connect: { id: me } },
        user2: { connect: { id: other } },
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

    const chat = await this.findOwnChat(chatId, req.user.id);
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
    const chat = await this.findOwnChat(chatId, req.user.id);
    if (!chat) {
      throw createAppError('Chat not found', 404);
    }

    await this.chatRepo.delete({
      where: { id: chatId },
    });

    sendResponse(res, 'CHAT_DELETED');
  });
}
