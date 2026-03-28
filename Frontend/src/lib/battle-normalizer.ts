import {
  Battle,
  BattleParticipant,
  BattleStatus,
  BattleType,
  Difficulty,
} from '@/types/battle';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

const toBattleStatus = (value: unknown): BattleStatus => {
  const s = String(value ?? '').toUpperCase();
  const map: Record<string, BattleStatus> = {
    WAITING: 'WAITING',
    LOBBY: 'LOBBY',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    // Legacy / alias support
    UPCOMING: 'WAITING',
    PENDING: 'WAITING',
    ACTIVE: 'IN_PROGRESS',
    CANCELED: 'CANCELLED',
  };
  return map[s] ?? 'WAITING';
};

const toBattleType = (value: unknown): BattleType => {
  const t = String(value ?? '').toUpperCase();
  const map: Record<string, BattleType> = {
    QUICK: 'QUICK',
    SCHEDULED: 'SCHEDULED',
    PRACTICE: 'PRACTICE',
    INSTANT: 'QUICK', // legacy alias
    TOURNAMENT: 'QUICK', // legacy alias
  };
  return map[t] ?? 'QUICK';
};

const toDifficulty = (value: unknown): Difficulty => {
  const d = String(value ?? '').toUpperCase();
  if (d === 'EASY' || d === 'HARD') return d;
  return 'MEDIUM';
};

export const normalizeBattleParticipant = (p: Raw): BattleParticipant => ({
  id: String(p.id ?? ''),
  battle_id: String(p.battle_id ?? p.battleId ?? ''),
  user_id: String(p.user_id ?? p.userId ?? ''),
  user: {
    id: String(p.user?.id ?? p.user_id ?? ''),
    username: String(p.user?.username ?? p.username ?? 'Unknown'),
    avatar_url: p.user?.avatar_url ?? p.avatar_url ?? null,
    first_name: p.user?.first_name,
    last_name: p.user?.last_name,
  },
  status: p.status ?? 'JOINED',
  score: Number(p.score ?? 0),
  rank: Number(p.rank ?? 0),
  correct_count: Number(p.correct_count ?? 0),
  wrong_count: Number(p.wrong_count ?? 0),
  avg_time_per_answer_ms: Number(p.avg_time_per_answer_ms ?? 0),
  completed_at: p.completed_at ?? null,
  last_seen_at: p.last_seen_at ?? null,
});

export const normalizeBattle = (battle: Raw): Battle => ({
  id: String(battle.id ?? ''),
  slug: battle.slug ?? null,
  title: String(battle.title ?? ''),
  description: battle.description ?? null,
  type: toBattleType(battle.type),
  status: toBattleStatus(battle.status),
  topic_id: battle.topic_id ?? battle.topicId ?? null,
  user_id: String(battle.user_id ?? battle.userId ?? ''),
  question_source_type: battle.question_source_type ?? null,
  question_source_id: battle.question_source_id ?? null,
  difficulty: toDifficulty(battle.difficulty),
  max_participants: Number(
    battle.max_participants ?? battle.maxParticipants ?? 6,
  ),
  current_participants: Number(
    battle.current_participants ??
      battle.currentParticipants ??
      battle._count?.participants ??
      0,
  ),
  total_questions: Number(battle.total_questions ?? 0),
  time_per_question: Number(battle.time_per_question ?? 30),
  points_per_question: Number(battle.points_per_question ?? 100),
  start_time: battle.start_time ?? battle.startDate ?? null,
  ended_at: battle.ended_at ?? null,
  winner_id: battle.winner_id ?? null,
  created_at: String(battle.created_at ?? battle.createdAt ?? ''),
  updated_at: String(battle.updated_at ?? battle.updatedAt ?? ''),
  topic: battle.topic
    ? {
        id: String(battle.topic.id ?? ''),
        title: String(battle.topic.title ?? 'Unknown'),
        description: battle.topic.description,
      }
    : null,
  creator: {
    id: String(battle.creator?.id ?? battle.user?.id ?? ''),
    username: String(
      battle.creator?.username ?? battle.user?.username ?? 'Unknown',
    ),
    avatar_url: battle.creator?.avatar_url ?? battle.user?.avatar_url ?? null,
    first_name: battle.creator?.first_name ?? battle.user?.first_name,
    last_name: battle.creator?.last_name ?? battle.user?.last_name,
  },
  winner: battle.winner ?? null,
  participants: Array.isArray(battle.participants)
    ? battle.participants.map(normalizeBattleParticipant)
    : [],
  _count: battle._count,
});
