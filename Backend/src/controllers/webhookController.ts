import { Request, Response } from 'express';
import logger from '../utils/logger';
import { createUserProfile } from '../services/userService';

export class WebhookController {
  static async handleUserCreated(req: Request, res: Response) {
    try {
      const { user } = req.body;

      await createUserProfile(user.id, {
        email: user.email,
        username: user.user_metadata?.username || user.email.split('@')[0],
        experienceLevel: user.user_metadata?.experience_level || 'beginner',
        learningGoals: user.user_metadata?.learning_goals || [],
      });

      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Webhook error:', error);
      res.status(400).json({ error: 'Failed to process webhook' });
    }
  }
}
