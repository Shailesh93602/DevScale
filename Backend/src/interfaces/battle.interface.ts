import { BattleStatus, BattleType, Difficulty, Length } from '@prisma/client';

export interface IBattle {
  id: string;
  title: string;
  description: string;
  type: BattleType;
  status: BattleStatus;
  topic_id: string;
  user_id: string;
  difficulty: Difficulty;
  length: Length;
  max_participants: number;
  current_participants: number;
  start_time: Date;
  end_time: Date;
  points_per_question: number;
  time_per_question: number;
  total_questions: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateBattleDTO {
  title: string;
  description: string;
  type: BattleType;
  topic_id: string;
  difficulty: Difficulty;
  length: Length;
  max_participants?: number;
  start_time: Date;
  end_time: Date;
  points_per_question?: number;
  time_per_question?: number;
  total_questions?: number;
  user_id: string;
}
