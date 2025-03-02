import Joi from 'joi';

export const createBattleValidationSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  description: Joi.string().required().min(10),
  topicId: Joi.string().required(),
  difficulty: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
});
