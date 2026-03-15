import Joi from 'joi';
import { BattleType, BattleStatus, Difficulty } from '@prisma/client';

// Common validation for battle IDs
export const battleIdValidation = Joi.object({
  id: Joi.string().uuid().required(),
});

// Validation for creating a new battle
export const createBattleValidationSchema = Joi.object({
  title: Joi.string().required().min(5).max(200).messages({
    'string.min': 'Title must be at least 5 characters long',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().required().min(10).messages({
    'string.min': 'Description must be at least 10 characters long',
    'any.required': 'Description is required',
  }),
  topic_id: Joi.string().uuid().required().messages({
    'string.guid': 'Topic ID must be a valid UUID',
    'any.required': 'Topic ID is required',
  }),
  difficulty: Joi.string()
    .valid(...Object.values(Difficulty))
    .required()
    .messages({
      'any.only': 'Difficulty must be one of: EASY, MEDIUM, HARD',
      'any.required': 'Difficulty is required',
    }),
  length: Joi.string().valid('short', 'medium', 'long').required().messages({
    'any.only': 'Length must be one of: short, medium, long',
    'any.required': 'Length is required',
  }),
  type: Joi.string()
    .valid(...Object.values(BattleType))
    .required()
    .messages({
      'any.only':
        'Type must be one of: INSTANT, SCHEDULED, TOURNAMENT, PRACTICE',
      'any.required': 'Type is required',
    }),
  max_participants: Joi.number()
    .integer()
    .min(2)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Maximum participants must be at least 2',
      'number.max': 'Maximum participants cannot exceed 100',
    }),
  start_time: Joi.date().greater('now').required().messages({
    'date.greater': 'Start time must be in the future',
    'any.required': 'Start time is required',
  }),
  end_time: Joi.date().greater(Joi.ref('start_time')).required().messages({
    'date.greater': 'End time must be after start time',
    'any.required': 'End time is required',
  }),
  points_per_question: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Points per question must be at least 1',
      'number.max': 'Points per question cannot exceed 100',
    }),
  time_per_question: Joi.number()
    .integer()
    .min(10)
    .max(600)
    .default(60)
    .messages({
      'number.min': 'Time per question must be at least 10 seconds',
      'number.max': 'Time per question cannot exceed 600 seconds (10 minutes)',
    }),
  total_questions: Joi.number().integer().min(1).max(50).default(10).messages({
    'number.min': 'Total questions must be at least 1',
    'number.max': 'Total questions cannot exceed 50',
  }),
});

// Validation for updating a battle
export const updateBattleValidationSchema = Joi.object({
  title: Joi.string().min(5).max(200),
  description: Joi.string().min(10),
  status: Joi.string().valid(...Object.values(BattleStatus)),
  max_participants: Joi.number().integer().min(2).max(100),
  start_time: Joi.date().greater('now'),
  end_time: Joi.date().greater(Joi.ref('start_time')),
  points_per_question: Joi.number().integer().min(1).max(100),
  time_per_question: Joi.number().integer().min(10).max(600),
  total_questions: Joi.number().integer().min(1).max(50),
}).min(1); // At least one field must be provided

// Validation for joining a battle
export const joinBattleValidationSchema = Joi.object({
  battle_id: Joi.string().uuid().required(),
});

// Validation for submitting an answer
export const submitAnswerValidationSchema = Joi.object({
  battle_id: Joi.string().uuid().required(),
  question_id: Joi.string().uuid().required(),
  answer: Joi.string().required().max(1000),
  time_taken: Joi.number().integer().min(0).required(),
});

// Validation for battle leaderboard
export const battleLeaderboardValidationSchema = Joi.object({
  battle_id: Joi.string().uuid().required(),
  limit: Joi.number().integer().min(1).max(100).default(10),
  page: Joi.number().integer().min(1).default(1),
});

// Validation for updating battle status
export const updateBattleStatusValidationSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(BattleStatus))
    .required()
    .messages({
      'any.only': `Status must be one of: ${Object.values(BattleStatus).join(', ')}`,
      'any.required': 'Status is required',
    }),
});

// Validation for rescheduling a battle
export const rescheduleBattleValidationSchema = Joi.object({
  start_time: Joi.date().greater('now').required().messages({
    'date.greater': 'Start time must be in the future',
    'any.required': 'Start time is required',
  }),
  end_time: Joi.date().greater(Joi.ref('start_time')).required().messages({
    'date.greater': 'End time must be after start time',
    'any.required': 'End time is required',
  }),
});
