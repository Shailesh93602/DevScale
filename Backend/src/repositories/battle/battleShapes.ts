import { Prisma } from '@prisma/client';
import { BattleStatus, BattleType, Difficulty } from '../../constants/enums';

export type UserParticipation = Prisma.BattleParticipantGetPayload<{
  include: {
    battle: {
      select: {
        id: true;
        title: true;
        status: true;
        winner_id: true;
        difficulty: true;
        topic: { select: { id: true; title: true } };
        ended_at: true;
        created_at: true;
      };
    };
  };
}>;

// ─── Public selector shapes ────────────────────────────────────────────────

export const creatorSelect = {
  id: true,
  username: true,
  avatar_url: true,
  first_name: true,
  last_name: true,
} as const;

export const participantInclude = {
  user: { select: creatorSelect },
} as const;

export const battleDetailInclude = {
  topic: { select: { id: true, title: true } },
  creator: { select: creatorSelect },
  winner: { select: creatorSelect },
  participants: {
    include: participantInclude,
    orderBy: { score: 'desc' as const },
  },
  _count: { select: { questions: true, participants: true } },
} as const;

export type BattleSummary = Prisma.BattleGetPayload<{
  include: {
    topic: { select: { id: true; title: true } };
    creator: { select: typeof creatorSelect };
    _count: { select: { participants: true; questions: true } };
  };
}>;

export type BattleDetail = Prisma.BattleGetPayload<{
  include: typeof battleDetailInclude;
}>;

// ─── Query parameter types ─────────────────────────────────────────────────

export interface BattleListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BattleStatus;
  difficulty?: Difficulty;
  type?: BattleType;
  topic_id?: string;
  user_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface BattleListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
