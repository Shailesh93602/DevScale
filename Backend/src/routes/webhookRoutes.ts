import { Router } from 'express';
import { WebhookController } from '../controllers/webhookController';

const router = Router();

router.post('/user-created', WebhookController.handleUserCreated);

export default router;
