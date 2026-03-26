import Joi from 'joi';
import { BattleType, Difficulty } from '@prisma/client';

export const battleIdValidation = Joi.object({
  id: Joi.string().min(2).max(120).required(),
});

const questionSourceSchema = Joi.object({
  type: Joi.string()
    .valid('topic', 'subject', 'main_concept', 'roadmap', 'dsa')
    .required()
    .messages({ 'any.only': 'source type must be topic, subject, main_concept, roadmap, or dsa' }),
  id: Joi.string().min(2).max(120).required().messages({
    'any.required': 'source id is required',
  }),
  difficulty: Joi.string().valid(...Object.values(Difficulty)).optional(),
  categories: Joi.array().items(Joi.string()).optional(),
  count: Joi.number().integer().min(5).max(50).optional(),
});

export const questionPoolQuerySchema = Joi.object({
  type: Joi.string()
    .valid('topic', 'subject', 'main_concept', 'roadmap', 'dsa')
    .required(),
  id: Joi.string().min(2).max(120).required(),
  difficulty: Joi.string().valid(...Object.values(Difficulty)).optional(),
  categories: Joi.string().optional(), // comma-separated
  count: Joi.number().integer().min(1).max(50).optional(),
});

export const createBattleValidationSchema = Joi.object({
  title: Joi.string().required().min(5).max(80).messages({
    'string.min': 'Title must be at least 5 characters',
    'string.max': 'Title cannot exceed 80 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().max(500).optional().allow(''),
  // topic_id is optional when question_source is provided
  topic_id: Joi.string().uuid().optional(),
  question_source: questionSourceSchema.optional(),
  difficulty: Joi.string()
    .valid(...Object.values(Difficulty))
    .required()
    .messages({
      'any.only': 'Difficulty must be EASY, MEDIUM, or HARD',
      'any.required': 'Difficulty is required',
    }),
  type: Joi.string()
    .valid(...Object.values(BattleType))
    .required()
    .messages({
      'any.only': 'Type must be QUICK, SCHEDULED, or PRACTICE',
      'any.required': 'Type is required',
    }),
  max_participants: Joi.number().integer().min(2).max(10).default(6).messages({
    'number.min': 'Must allow at least 2 participants',
    'number.max': 'Cannot exceed 10 participants',
  }),
  total_questions: Joi.number().integer().min(5).max(20).default(10).messages({
    'number.min': 'Minimum 5 questions',
    'number.max': 'Maximum 20 questions',
  }),
  time_per_question: Joi.number()
    .integer()
    .min(15)
    .max(60)
    .default(30)
    .messages({
      'number.min': 'Minimum 15 seconds per question',
      'number.max': 'Maximum 60 seconds per question',
    }),
  points_per_question: Joi.number()
    .integer()
    .min(10)
    .max(1000)
    .default(100)
    .messages({
      'number.min': 'Minimum 10 points per question',
    }),
  start_time: Joi.when('type', {
    is: 'SCHEDULED',
    then: Joi.date()
      .min(new Date(Date.now() + 5 * 60 * 1000))
      .required()
      .messages({
        'date.min': 'Scheduled start time must be at least 5 minutes in the future',
        'any.required': 'Start time is required for scheduled battles',
      }),
    otherwise: Joi.date().optional(),
  }),
}).or('topic_id', 'question_source');

export const submitAnswerValidationSchema = Joi.object({
  battle_id: Joi.string().uuid().required(),
  question_id: Joi.string().uuid().required(),
  selected_option: Joi.number().integer().min(0).max(3).required().messages({
    'number.min': 'Invalid option index',
    'number.max': 'Invalid option index',
    'any.required': 'Selected option is required',
  }),
  time_taken_ms: Joi.number().integer().min(0).required().messages({
    'any.required': 'Time taken is required',
  }),
});

export const addQuestionsValidationSchema = Joi.object({
  questions: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().min(5).max(500).required().messages({
          'string.min': 'Question text must be at least 5 characters',
          'any.required': 'Question text is required',
        }),
        options: Joi.array()
          .items(Joi.string().min(1).max(200).required())
          .length(4)
          .required()
          .messages({
            'array.length': 'Each question must have exactly 4 options',
            'any.required': 'Options are required',
          }),
        correct_answer: Joi.number().integer().min(0).max(3).required().messages({
          'number.min': 'correct_answer must be an index 0–3',
          'number.max': 'correct_answer must be an index 0–3',
          'any.required': 'correct_answer is required',
        }),
        explanation: Joi.string().max(500).optional().allow(''),
        points: Joi.number().integer().min(10).max(1000).optional(),
        time_limit: Joi.number().integer().min(15).max(60).optional(),
      })
    )
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.min': 'At least 1 question is required',
      'array.max': 'Cannot add more than 20 questions at once',
      'any.required': 'questions array is required',
    }),
});

export const updateBattleStatusValidationSchema = Joi.object({
  status: Joi.string()
    .valid('LOBBY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    .required()
    .messages({
      'any.only': 'Invalid status',
      'any.required': 'Status is required',
    }),
});
