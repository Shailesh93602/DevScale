import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import { createAppError } from '../../utils/errorHandler.js';
import { isUuid } from '../../utils/slugify.js';
import {
  getCached,
  setCached,
  invalidatePattern,
} from '../../services/memoryCache.js';
import {
  battleDetailInclude,
  creatorSelect,
  type BattleDetail,
  type BattleListMeta,
  type BattleListParams,
  type BattleSummary,
} from './battleShapes.js';

// ── Browse ──────────────────────────────────────────────────────────────

/**
 * Global aggregate stats for the Battle Zone header bar.
 * Single SQL query instead of fetching 100 full battle objects.
 * Cached 30s — fresh enough for a live counter.
 */
export async function getGlobalStats(): Promise<{
  activeBattles: number;
  upcomingBattles: number;
  totalParticipants: number;
}> {
  const cacheKey = 'battles:global-stats';
  const cached = getCached<{
    activeBattles: number;
    upcomingBattles: number;
    totalParticipants: number;
  }>(cacheKey);
  if (cached) return cached;

  const [row] = await prisma.$queryRaw<
    [{ active: number; upcoming: number; total_participants: bigint }]
  >`
    SELECT
      COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')::int          AS active,
      COUNT(*) FILTER (WHERE status IN ('WAITING', 'LOBBY'))::int  AS upcoming,
      COALESCE(SUM(current_participants), 0)::bigint               AS total_participants
    FROM "Battle"
  `;

  const stats = {
    activeBattles: row.active,
    upcomingBattles: row.upcoming,
    totalParticipants: Number(row.total_participants),
  };

  setCached(cacheKey, stats, 30);
  return stats;
}

export async function getBattles(
  params: BattleListParams
): Promise<{ data: BattleSummary[]; meta: BattleListMeta }> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 12));
  const skip = (page - 1) * limit;

  // Cache key encodes all list params — stable across concurrent identical requests
  const cacheKey = `battles:list:p${page}:l${limit}:s${params.search || ''}:st${params.status || ''}:d${params.difficulty || ''}:t${params.type || ''}:tp${params.topic_id || ''}:u${params.user_id || ''}:sb${params.sort_by || ''}:so${params.sort_order || ''}`;
  const cachedList = getCached<{
    data: BattleSummary[];
    meta: BattleListMeta;
  }>(cacheKey);
  if (cachedList) return cachedList;

  const where: Prisma.BattleWhereInput = {};

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.status) where.status = params.status;
  if (params.difficulty) where.difficulty = params.difficulty;
  if (params.type) where.type = params.type;
  if (params.topic_id) where.topic_id = params.topic_id;
  if (params.user_id) where.user_id = params.user_id;

  const allowedSortFields = [
    'created_at',
    'start_time',
    'current_participants',
    'title',
  ];
  const sortField = allowedSortFields.includes(params.sort_by || '')
    ? params.sort_by!
    : 'created_at';
  const sortOrder = params.sort_order === 'asc' ? 'asc' : 'desc';

  const [data, total] = await prisma.$transaction([
    prisma.battle.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder },
      include: {
        topic: { select: { id: true, title: true } },
        creator: { select: creatorSelect },
        _count: { select: { participants: true, questions: true } },
      },
    }),
    prisma.battle.count({ where }),
  ]);

  const result = {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
  setCached(cacheKey, result, 30); // 30s TTL
  return result;
}

/** Invalidate battle list and global-stats caches (call after create/join/cancel). */
export function invalidateBattleListCache(): void {
  invalidatePattern('battles:list:');
  invalidatePattern('battles:global-stats');
}

// ── Detail ──────────────────────────────────────────────────────────────

export async function getBattleDetails(
  idOrSlug: string
): Promise<BattleDetail> {
  const battle = isUuid(idOrSlug)
    ? await prisma.battle.findUnique({
        where: { id: idOrSlug },
        include: battleDetailInclude,
      })
    : await prisma.battle.findFirst({
        where: { slug: idOrSlug },
        include: battleDetailInclude,
      });

  if (!battle) throw createAppError('Battle not found', 404);
  return battle;
}
