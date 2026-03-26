import Joi from 'joi';

export const createRoadmapValidation = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
  }),
  description: Joi.string().required().messages({
    'any.required': 'Description is required',
  }),
  difficulty: Joi.string()
    .valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EASY', 'MEDIUM', 'HARD')
    .required()
    .messages({
      'any.required': 'Difficulty is required',
      'any.only': 'Invalid difficulty level. Use BEGINNER, INTERMEDIATE, or ADVANCED.',
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

export const enrollRoadmapValidation = Joi.object({
  roadmapId: Joi.string().required().messages({
    'any.required': 'Roadmap ID is required',
  }),
});

export const addCommentValidation = Joi.object({
  content: Joi.string().required().min(1).max(1000).messages({
    'any.required': 'Comment content is required',
    'string.empty': 'Comment content cannot be empty',
    'string.min': 'Comment content must be at least 1 character long',
    'string.max': 'Comment content cannot exceed 1000 characters',
  }),
  parent_id: Joi.string().optional(),
});

export const roadmapQueryValidation = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10),
  page: Joi.number().integer().min(1).default(1),
  search: Joi.string().allow('').default(''),
  category: Joi.string().allow('').default(''),
  difficulty: Joi.string()
    .valid('EASY', 'MEDIUM', 'HARD')
    .allow('')
    .default(''),
  sort: Joi.string().valid('popular', 'recent', 'rating').allow('').default(''),
  type: Joi.string()
    .valid('all', 'featured', 'trending', 'my-roadmaps', 'enrolled', 'recommended')
    .default('all'),
});
