import Joi from 'joi';

export const createRoadmapValidation = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
  }),
  description: Joi.string().required().messages({
    'any.required': 'Description is required',
  }),
  difficulty: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .required()
    .messages({
      'any.required': 'Difficulty is required',
      'any.only': 'Invalid difficulty level',
    }),
  estimatedHours: Joi.number().optional().integer().min(1).messages({
    'number.base': 'Estimated hours must be a number',
    'number.min': 'Estimated hours must be a positive number',
  }),
  tags: Joi.array().optional().messages({
    'any.required': 'Tags must be an array',
  }),
});

export const updateSubjectsOrderValidation = Joi.object({
  subjectOrders: Joi.array()
    .required()
    .messages({
      'any.required': 'Subject orders must be an array',
    })
    .custom((orders) => {
      return orders.every(
        (order: { subjectId: string; order: number }) =>
          typeof order.subjectId === 'string' &&
          typeof order.order === 'number' &&
          order.order >= 0
      );
    })
    .messages({
      'any.custom': 'Invalid subject order format',
    }),
});
