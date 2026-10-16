import Joi from 'joi';
import { Difficulty } from '../constants/enums';

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
  points: Joi.number().integer().min(0).required().messages({
    'any.required': 'Points are required',
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
  exampleOutput: Joi.string().required().messages({
    'any.required': 'Example output is required',
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
  // Joi keys are literal property names, not wildcard paths: the former
  // 'testCases.*.input' key demanded a top-level property by that name, so
  // every create/update returned 400. Items are validated here instead.
  testCases: Joi.array()
    .items(
      Joi.object({
        input: Joi.string().allow('').required().messages({
          'any.required': 'Test case input is required',
        }),
        output: Joi.string().allow('').required().messages({
          'any.required': 'Test case output is required',
        }),
      })
    )
    .min(1)
    .max(100)
    .required()
    .messages({
      'any.required': 'Test cases must be an array',
    }),
  language: Joi.string()
    .valid('javascript', 'python', 'java', 'cpp', 'go')
    .required()
    .messages({
      'any.required': 'Language is required',
      'any.only': 'Unsupported programming language',
    }),
});

// PATCH: every field optional, but at least one must be present.
export const updateChallengeValidation = createChallengeValidation
  .fork(Object.keys(createChallengeValidation.describe().keys), (schema) =>
    schema.optional()
  )
  .min(1);

export const submitChallengeValidation = Joi.object({
  code: Joi.string().required().messages({
    'any.required': 'Code is required',
  }),
  language: Joi.string()
    .valid('javascript', 'python', 'java', 'cpp', 'go')
    .required()
    .messages({
      'any.required': 'Language is required',
      'any.only': 'Unsupported programming language',
    }),
});

export const runCodeValidation = Joi.object({
  code: Joi.string().required().messages({
    'any.required': 'Code is required',
  }),
  // Must be constrained here, not deep inside the executor. An unknown language
  // used to reach getLanguageId() *inside* the opossum circuit breaker, so its
  // throw counted as a Judge0 failure — three junk requests could trip the
  // breaker and disable code execution for every user for 30 seconds.
  language: Joi.string()
    .valid('javascript', 'python', 'java', 'cpp', 'go')
    .required()
    .messages({
      'any.required': 'Language is required',
      'any.only': 'Unsupported programming language',
    }),
  input: Joi.string().optional().allow(''),
  challengeId: Joi.string().optional(),
  challenge_id: Joi.string().optional(),
  challengeTitle: Joi.string().optional(),
  id: Joi.string().optional(),
});

export const saveDraftValidation = Joi.object({
  challengeId: Joi.string().required(),
  code: Joi.string().required(),
  language: Joi.string().required(),
});
