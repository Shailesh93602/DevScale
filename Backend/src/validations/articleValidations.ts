import Joi from 'joi';

// POST /articles/status
export const updateArticleStatusSchema = Joi.object({
  articleId: Joi.string().min(2).max(120).required(),
  status: Joi.string()
    .valid('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED', 'REJECTED')
    .required()
    .messages({ 'any.only': 'status must be DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED, or REJECTED' }),
});

// POST /articles/:id/moderation
export const updateModerationNotesSchema = Joi.object({
  notes: Joi.string().max(2000).allow('').optional(),
  action: Joi.string().valid('APPROVE', 'REJECT', 'FLAG').required().messages({
    'any.only': 'action must be APPROVE, REJECT, or FLAG',
    'any.required': 'action is required',
  }),
});

// POST /articles/:id/update
export const updateArticleContentSchema = Joi.object({
  title: Joi.string().min(3).max(300).optional(),
  content: Joi.string().min(10).optional(),
}).min(1).messages({
  'object.min': 'Provide at least one field to update (title or content)',
});

// Param validator reused across article routes
export const articleIdParamSchema = Joi.object({
  id: Joi.string().min(2).max(120).required(),
});
