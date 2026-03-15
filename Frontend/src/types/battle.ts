export type BattleStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'UPCOMING'
  | 'IN_PROGRESS';
export type BattleType = 'INSTANT' | 'SCHEDULED' | 'TOURNAMENT' | 'PRACTICE';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Length = 'short' | 'medium' | 'long';

export interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface BattleParticipant {
  id: string;
  userId: string;
  battleId: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface Battle {
  id: string;
  title: string;
  description: string;
  type: BattleType;
  status: BattleStatus;
  topic_id: string;
  user_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  length: Length;
  maxParticipants: number;
  currentParticipants: number;
  prize: number;
  startDate: string;
  endDate: string;
  points_per_question: number;
  time_per_question: number;
  total_questions: number;
  createdAt: string;
  updatedAt: string;
  topic: Topic;
  user: User;
  participants: BattleParticipant[];
  _count?: {
    participants: number;
    questions: number;
  };
  category: string;
  tags: string[];
  creatorId: string;
}

export interface BattleQuestion {
  id: string;
  battle_id: string;
  question: string;
  options: string[];
  correct_answer?: string;
  points: number;
  time_limit: number;
  order: number;
}

export interface BattleFilters {
  search?: string;
  status?: BattleStatus | 'all';
  difficulty?: 'all' | 'easy' | 'medium' | 'hard';
  category?: string;
  length?: 'short' | 'medium' | 'long';
  sortBy?: 'createdAt' | 'participants' | 'prize';
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
  user_id?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
