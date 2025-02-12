import Joi from 'joi';

export const updateProgressValidation = Joi.object({
  topicId: Joi.string().required().messages({
    'any.required': 'Topic ID is required',
  }),
  status: Joi.string().valid('completed', 'in_progress').required().messages({
    'any.required': 'Status is required',
    'any.only': 'Invalid status',
  }),
  score: Joi.number().optional().integer().min(0).max(100).messages({
    'number.base': 'Score must be a number',
    'number.min': 'Score must be between 0 and 100',
    'number.max': 'Score must be between 0 and 100',
  }),
});
