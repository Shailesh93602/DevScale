import Joi from 'joi';

export const leaderboardQuerySchema = Joi.object({
  subjectId: Joi.string().required(),
  timeRange: Joi.string()
    .valid('daily', 'weekly', 'monthly', 'all')
    .default('all'),
  limit: Joi.number().min(1).max(100).default(10),
});
