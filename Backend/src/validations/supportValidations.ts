import Joi from 'joi';

export const ticketSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  description: Joi.string().required().min(10),
  category: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').required(),
});

export const bugReportSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  description: Joi.string().required().min(10),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  environment: Joi.string(),
  // snake_case: the repository and the BugReport columns read these names.
  steps_to_reproduce: Joi.string(),
  expected_behavior: Joi.string(),
  actual_behavior: Joi.string(),
});

export const featureRequestSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  description: Joi.string().required().min(10),
  category: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
});

export const helpArticleSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  content: Joi.string().required().min(50),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string()),
});

export const ticketResponseSchema = Joi.object({
  content: Joi.string().trim().min(1).max(10000).required(),
  isInternal: Joi.boolean(),
});

export const ticketStatusSchema = Joi.object({
  status: Joi.string()
    .valid('open', 'in_progress', 'resolved', 'closed')
    .required(),
});
