import type { ResponseConfig } from './types.js';

/** Battles, matchmaking, ratings and leaderboards. */
export const battleMessages = {
  LEADERBOARD_FETCHED: {
    status: 200,
    success: true,
    message: 'Leaderboard retrieved successfully',
  },
  BATTLES_FETCHED: {
    status: 200,
    success: true,
    message: 'Battles retrieved successfully',
  },
  BATTLE_FETCHED: {
    status: 200,
    success: true,
    message: 'Battle retrieved successfully',
  },
  BATTLE_CREATED: {
    status: 201,
    success: true,
    message: 'Battle created successfully',
  },
  BATTLE_JOINED: {
    status: 200,
    success: true,
    message: 'Battle joined successfully',
  },
  BATTLE_LEFT: {
    status: 200,
    success: true,
    message: 'Battle left successfully',
  },
  STATISTICS_FETCHED: {
    status: 200,
    success: true,
    message: 'Statistics fetched successfully',
  },
  ANSWER_SUBMITTED: {
    status: 200,
    success: true,
    message: 'Answer submitted successfully',
  },
  BATTLE_STATUS_UPDATED: {
    status: 200,
    success: true,
    message: 'Battle status updated successfully',
  },
  BATTLE_READY: {
    status: 200,
    success: true,
    message: 'Ready status updated',
  },
  BATTLE_STARTED: {
    status: 200,
    success: true,
    message: 'Battle started successfully',
  },
  BATTLE_CANCELLED: {
    status: 200,
    success: true,
    message: 'Battle cancelled successfully',
  },
  BATTLE_RESULTS_FETCHED: {
    status: 200,
    success: true,
    message: 'Battle results retrieved successfully',
  },
  BATTLE_MY_RESULTS_FETCHED: {
    status: 200,
    success: true,
    message: 'Your battle results retrieved successfully',
  },
  RATING_FETCHED: {
    status: 200,
    success: true,
    message: 'Rating retrieved successfully',
  },
  RATING_LEADERBOARD_FETCHED: {
    status: 200,
    success: true,
    message: 'Rating leaderboard retrieved successfully',
  },
  MATCHMAKING_JOINED: {
    status: 200,
    success: true,
    message: 'Joined matchmaking queue',
  },
  MATCHMAKING_LEFT: {
    status: 200,
    success: true,
    message: 'Left matchmaking queue',
  },
  MATCHMAKING_STATUS_FETCHED: {
    status: 200,
    success: true,
    message: 'Matchmaking status retrieved successfully',
  },
  BATTLE_QUESTIONS_ADDED: {
    status: 201,
    success: true,
    message: 'Questions added to battle successfully',
  },
  BATTLE_GLOBAL_STATS_FETCHED: {
    status: 200,
    success: true,
    message: 'Battle global stats fetched successfully',
  },
  QUESTION_POOL_FETCHED: {
    status: 200,
    success: true,
    message: 'Question pool fetched successfully',
  },
  QUESTION_POOL_EMPTY: {
    status: 200,
    success: true,
    message: 'No questions available for the selected source',
  },
} satisfies Record<string, ResponseConfig>;
