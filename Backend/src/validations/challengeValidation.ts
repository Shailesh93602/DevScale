import Joi from 'joi';
import { Difficulty } from '@prisma/client';

export const createChallengeValidation = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
  }),
  description: Joi.string().required().messages({
    'any.required': 'Description is required',
  }),
  difficulty: Joi.string()
    .valid(...Object.values(Difficulty))
    .required()
    .messages({
      'any.required': 'Difficulty is required',
      'any.only': 'Invalid difficulty level',
    }),
  category: Joi.string().required().messages({
    'any.required': 'Category is required',
  }),
  inputFormat: Joi.string().required().messages({
    'any.required': 'Input format is required',
  }),
  outputFormat: Joi.string().required().messages({
    'any.required': 'Output format is required',
  }),
  exampleInput: Joi.string().required().messages({
    'any.required': 'Example input is required',
  }),
  constraints: Joi.string().required().messages({
    'any.required': 'Constraints are required',
  }),
  functionSignature: Joi.string().required().messages({
    'any.required': 'Function signature is required',
  }),
  timeLimit: Joi.number().optional().integer().min(1).messages({
    'number.base': 'Time limit must be a number',
    'number.min': 'Time limit must be a positive number',
  }),
  memoryLimit: Joi.number().optional().integer().min(1).messages({
    'number.base': 'Memory limit must be a number',
    'number.min': 'Memory limit must be a positive number',
  }),
  tags: Joi.array().optional().messages({
    'any.required': 'Tags must be an array',
  }),
  testCases: Joi.array().required().messages({
    'any.required': 'Test cases must be an array',
  }),
  'testCases.*.input': Joi.string().required().messages({
    'any.required': 'Test case input is required',
  }),
  'testCases.*.output': Joi.string().required().messages({
    'any.required': 'Test case output is required',
  }),
  language: Joi.string()
    .valid('javascript', 'python', 'java', 'cpp')
    .required()
    .messages({
      'any.required': 'Language is required',
      'any.only': 'Unsupported programming language',
    }),
});

export const submitChallengeValidation = Joi.object({
  code: Joi.string().required().messages({
    'any.required': 'Code is required',
  }),
  language: Joi.string()
    .valid('javascript', 'python', 'java', 'cpp')
    .required()
    .messages({
      'any.required': 'Language is required',
      'any.only': 'Unsupported programming language',
    }),
});

export const runCodeValidation = Joi.object({
  code: Joi.string().required(),
  language: Joi.string().valid('javascript', 'python', 'java', 'cpp').required(),
});

export const saveDraftValidation = Joi.object({
  challengeId: Joi.string().required(),
  code: Joi.string().required(),
  language: Joi.string().valid('javascript', 'python', 'java', 'cpp').required(),
});
