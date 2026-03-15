import Joi from 'joi';
import { ActivityType } from '@prisma/client';

export const updateStreakSchema = Joi.object({
  activityType: Joi.string()
    .required()
    .valid(...Object.values(ActivityType))
    .messages({
      'any.required': 'Activity type is required',
      'any.only': 'Invalid activity type',
    }),
  minutesSpent: Joi.number().required().min(1).messages({
    'number.min': 'Minutes spent must be at least 1',
  }),
  timezone: Joi.string().default('UTC').messages({
    'string.base': 'Timezone must be a string',
  }),
});
