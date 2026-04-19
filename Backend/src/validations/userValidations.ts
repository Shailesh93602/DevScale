import Joi from 'joi';

export const userInsertionSchema = Joi.object({
  id: Joi.string().optional(),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-z0-9_]+$/)
    .required()
    .messages({
      'string.min': 'Username is not available',
      'string.max': 'Username is not available',
      'string.pattern.base': 'Username is not available',
      'any.required': 'Username is required',
    }),
  first_name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name cannot exceed 50 characters',
  }),
  last_name: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 1 character',
    'string.max': 'Last name cannot exceed 50 characters',
  }),
  bio: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Bio cannot exceed 500 characters',
  }),
  note: Joi.string().max(200).optional().allow('').messages({
    'string.max': 'Note cannot exceed 200 characters',
  }),
  specialization: Joi.string().optional().allow(''),
  college: Joi.string().optional().allow(''),
  graduation_year: Joi.number()
    .integer()
    .min(1900)
    .max(2100)
    .optional()
    .allow(null),
  experience_level: Joi.string().optional().allow(''),
  github_url: Joi.string()
    .pattern(/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/)
    .optional()
    .allow('')
    .allow(null)
    .messages({
      'string.pattern.base': 'Please provide a valid GitHub profile URL',
    }),
  linkedin_url: Joi.string()
    .pattern(
      /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/
    )
    .optional()
    .allow('')
    .allow(null)
    .messages({
      'string.pattern.base': 'Please provide a valid LinkedIn profile URL',
    }),
  twitter_url: Joi.string()
    .pattern(/^https?:\/\/(www\.)?(twitter|x)\.com\/[a-z0-9_]+\/?$/i)
    .optional()
    .allow('')
    .allow(null)
    .messages({
      'string.pattern.base': 'Please provide a valid X (Twitter) profile URL',
    }),
  website_url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .allow(null)
    .messages({
      'string.uri': 'Please provide a valid Website URL',
    }),
  address: Joi.string().optional().allow(''),
  skills: Joi.array()
    .items(Joi.string().trim().min(1).max(50))
    .optional()
    .allow(null)
    .default([])
    .messages({
      'array.base': 'Skills must be an array of strings',
    }),
}).options({ abortEarly: false, allowUnknown: true });

export const insertUserRoadmapSchema = Joi.object({
  roadmap_id: Joi.string().min(2).max(120).required().messages({
    'any.required': 'roadmap_id is required',
  }),
});
