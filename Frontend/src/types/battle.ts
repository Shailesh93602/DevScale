// ── Enums ────────────────────────────────────────────────────────────────────

export type BattleStatus = 'WAITING' | 'LOBBY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type BattleType = 'QUICK' | 'SCHEDULED' | 'PRACTICE';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ParticipantStatus = 'JOINED' | 'READY' | 'PLAYING' | 'COMPLETED' | 'DISCONNECTED';

// ── Domain objects ───────────────────────────────────────────────────────────

export interface BattleUser {
  id: string;
  username: string;
  avatar_url?: string | null;
  first_name?: string;
  last_name?: string;
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
}

export interface BattleParticipant {
  id: string;
  battle_id: string;
  user_id: string;
  user: BattleUser;
  status: ParticipantStatus;
  score: number;
  rank: number;
  correct_count: number;
  wrong_count: number;
  avg_time_per_answer_ms: number;
  completed_at?: string | null;
  last_seen_at?: string | null;
}

export interface Battle {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  type: BattleType;
  status: BattleStatus;
  topic_id?: string | null;
  user_id: string;
  question_source_type?: string | null;
  question_source_id?: string | null;
  difficulty: Difficulty;
  max_participants: number;
  current_participants: number;
  total_questions: number;
  time_per_question: number;
  points_per_question: number;
  start_time?: string | null;
  ended_at?: string | null;
  winner_id?: string | null;
  created_at: string;
  updated_at: string;
  topic?: Topic | null;
  creator: BattleUser;
  winner?: BattleUser | null;
  participants: BattleParticipant[];
  _count?: {
    participants: number;
    questions: number;
  };
}

export interface BattleQuestion {
  id: string;
  battle_id: string;
  question: string;
  options: string[];
  points: number;
  time_limit: number;
  order: number;
  // correct_answer and explanation are never sent by the API during the battle
}

// ── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string | null;
  score: number;
  rank: number;
  correct_count: number;
  total_time_ms: number;
}

// ── Answer result ────────────────────────────────────────────────────────────

export interface AnswerResult {
  is_correct: boolean;
  points_earned: number;
  correct_answer: number;
  explanation?: string | null;
}

// ── Filters ──────────────────────────────────────────────────────────────────

export interface BattleFilters {
  search?: string;
  status?: BattleStatus | 'all';
  difficulty?: Difficulty | 'all';
  type?: BattleType | 'all';
  topic_id?: string;
  user_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
