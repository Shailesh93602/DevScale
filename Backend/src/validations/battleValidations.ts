import Joi from 'joi';
import { BattleType, BattleStatus, Difficulty } from '@prisma/client';

// Common validation for battle IDs
export const battleIdValidation = Joi.object({
  id: Joi.string().uuid().required(),
});

// Validation for creating a new battle
export const createBattleValidationSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  description: Joi.string().required().min(10),
  topic_id: Joi.string().uuid().required(),
  difficulty: Joi.string()
    .valid(...Object.values(Difficulty))
    .required(),
  type: Joi.string()
    .valid(...Object.values(BattleType))
    .required(),
  max_participants: Joi.number().integer().min(2).max(100).default(10),
  start_time: Joi.date().greater('now').required(),
  end_time: Joi.date().greater(Joi.ref('start_time')).required(),
  points_per_question: Joi.number().integer().min(1).max(100).default(10),
  time_per_question: Joi.number().integer().min(10).max(600).default(60),
  total_questions: Joi.number().integer().min(1).max(50).default(10),
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
