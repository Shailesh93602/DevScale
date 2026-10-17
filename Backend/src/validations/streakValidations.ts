import Joi from 'joi';
import { DateTime } from 'luxon';
import { ActivityType } from '../constants/enums';

export const updateStreakSchema = Joi.object({
  activityType: Joi.string()
    .required()
    .valid(...Object.values(ActivityType))
    .messages({
      'any.required': 'Activity type is required',
      'any.only': 'Invalid activity type',
    }),
  minutesSpent: Joi.number().required().min(1).max(1440).messages({
    'number.min': 'Minutes spent must be at least 1',
    'number.max': 'Minutes spent cannot exceed a day (1440)',
  }),
  timezone: Joi.string()
    .default('UTC')
    .custom((tz: string, helpers) =>
      DateTime.now().setZone(tz).isValid ? tz : helpers.error('any.invalid')
    )
    .messages({
      'string.base': 'Timezone must be a string',
      'any.invalid': 'Timezone must be a valid IANA zone, e.g. Asia/Kolkata',
    }),
});
