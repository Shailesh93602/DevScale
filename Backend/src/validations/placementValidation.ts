import Joi from 'joi';

export const getResourcesSchema = Joi.object({
  userId: Joi.string().required(),
  subjectId: Joi.string().optional(),
});

export const getBooksSchema = Joi.object({
  subjectId: Joi.string().required(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
});
