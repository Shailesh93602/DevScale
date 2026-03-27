import Joi from 'joi';

export const createForumSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().min(10).max(10000).required().messages({
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description cannot exceed 10 000 characters',
    'any.required': 'Description is required',
  }),
});

export const updateForumSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(10000).optional(),
}).min(1).messages({
  'object.min': 'Provide at least one field to update (title or description)',
});
