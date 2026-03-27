import Joi from 'joi';

export const setRefreshCookieSchema = Joi.object({
  refresh_token: Joi.string().min(10).required().messages({
    'any.required': 'refresh_token is required',
    'string.min': 'refresh_token is too short',
  }),
});
