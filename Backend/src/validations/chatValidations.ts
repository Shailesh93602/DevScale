import Joi from 'joi';

export const createChatValidationSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  participants: Joi.array().items(Joi.string()).required(),
});

export const messageValidationSchema = Joi.object({
  message: Joi.string().required().min(5).max(200),
});
