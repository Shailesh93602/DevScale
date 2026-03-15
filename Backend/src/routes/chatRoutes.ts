import { BaseRouter } from './BaseRouter';
import ChatController from '../controllers/chatControllers';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createChatValidationSchema,
  messageValidationSchema,
} from '../validations/chatValidations';

export class ChatRoutes extends BaseRouter {
  private readonly chatController: ChatController;

  constructor() {
    super();
    this.chatController = new ChatController();
  }

  protected initializeRoutes(): void {
    this.router.get('/', authMiddleware, this.chatController.getChats);
    this.router.get('/:id', authMiddleware, this.chatController.getChat);
    this.router.post(
      '/create',
      authMiddleware,
      validateRequest(createChatValidationSchema),
      this.chatController.createChat
    );
    this.router.post(
      '/message/:id',
      authMiddleware,
      validateRequest(messageValidationSchema),
      this.chatController.createMessage
    );
    this.router.delete(
      '/delete/:id',
      authMiddleware,
      this.chatController.deleteChat
    );
  }
}

export default new ChatRoutes().getRouter();
