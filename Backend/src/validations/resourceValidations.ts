import Joi from 'joi';

// POST /resources/create
export const createResourceValidation = Joi.object({
  title: Joi.string().min(2).max(300).required(),
  content: Joi.string().min(1).required(),
  type: Joi.string().min(1).max(60).required(),
  description: Joi.string().max(2000).allow('').optional(),
  url: Joi.string().uri().allow('').optional(),
  category: Joi.string().max(60).allow('').optional(),
  difficulty: Joi.string().max(40).allow('').optional(),
  language: Joi.string().max(40).allow('').optional(),
});

// POST /resources/save/:id  (authors an article under the :id topic)
export const saveResourceValidation = Joi.object({
  content: Joi.string().min(1).required(),
});
