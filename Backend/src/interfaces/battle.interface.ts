import {
  BattleStatus,
  BattleType,
  BattleParticipantStatus,
  Difficulty,
} from '@prisma/client';

export interface IBattle {
  id: string;
  title: string;
  description?: string;
  type: BattleType;
  status: BattleStatus;
  topic_id: string;
  user_id: string;
  winner_id?: string;
  difficulty: Difficulty;
  max_participants: number;
  current_participants: number;
  start_time?: Date;
  ended_at?: Date;
  points_per_question: number;
  time_per_question: number;
  total_questions: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateBattleDTO {
  title: string;
  description?: string;
  type: BattleType;
  topic_id: string;
  difficulty: Difficulty;
  max_participants?: number;
  start_time?: Date;
  points_per_question?: number;
  time_per_question?: number;
  total_questions?: number;
  user_id: string;
}

export interface IBattleParticipant {
  id: string;
  battle_id: string;
  user_id: string;
  status: BattleParticipantStatus;
  score: number;
  rank?: number;
  correct_count: number;
  wrong_count: number;
  avg_time_per_answer_ms: number;
  joined_at: Date;
  completed_at?: Date;
  last_seen_at?: Date;
}

export interface IBattleQuestion {
  id: string;
  battle_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  points: number;
  time_limit: number;
  order: number;
}

export interface IBattleQuestionPublic {
  id: string;
  battle_id: string;
  question: string;
  options: string[];
  points: number;
  time_limit: number;
  order: number;
  // correct_answer intentionally omitted — sent only in answer_result
}

export interface IBattleAnswer {
  id: string;
  battle_id: string;
  question_id: string;
  user_id: string;
  selected_option: number;
  is_correct: boolean;
  time_taken_ms: number;
  points_earned: number;
  created_at: Date;
}

export interface ILeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  score: number;
  rank: number;
  correct_count: number;
  total_time_ms: number;
}

export interface IAnswerResult {
  question_id: string;
  is_correct: boolean;
  points_earned: number;
  correct_answer: number;
  explanation?: string;
  leaderboard: ILeaderboardEntry[];
}
