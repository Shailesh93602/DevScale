/**
 * Skill-based matchmaking queue (Feature 4b) — the /instant-battle backend.
 *
 * Players wait in a Redis SORTED SET keyed by Elo rating. A joining player is
 * paired with the nearest-rated waiter inside a band that WIDENS the longer
 * someone has waited. The pairing step is guarded by a Redlock on BOTH players
 * (locked in a deterministic order to avoid deadlock) and re-checks the queue
 * after acquiring the lock — so two concurrent joins can never grab the same
 * waiter and double-book them. On a match it creates a battle and notifies the
 * waiting player over their socket; the joining player gets the result inline.
 *
 * All collaborators are injectable, so the concurrency logic is unit-tested with
 * a fake Redis + Redlock (no live infra).
 */

import { redis as defaultRedis, redlock as defaultRedlock } from '../cacheService.js';
import { BattleRepository } from '../../repositories/battleRepository.js';
import socketService from '../socket.js';
import prisma from '../../lib/prisma.js';
import { DEFAULT_RATING } from '../rating/ratingMath.js';
import logger from '../../utils/logger.js';

const QUEUE_KEY = 'matchmaking:queue:quick';
const META_KEY = 'matchmaking:meta:quick';
const BASE_BAND = 100; // rating points
const BAND_PER_SECOND = 20; // widen while waiting
const MAX_BAND = 600;
const LOCK_TTL_MS = 5000;

export interface MatchResult {
  matched: boolean;
  battleId?: string;
  slug?: string;
  opponentId?: string;
}

export interface QueueStatus {
  inQueue: boolean;
  queueSize: number;
  rating: number | null;
}

interface QueueRedis {
  zadd(key: string, score: number, member: string): Promise<number | string>;
  zrem(key: string, ...members: string[]): Promise<number>;
  zscore(key: string, member: string): Promise<string | null>;
  zcard(key: string): Promise<number>;
  zrangebyscore(
    key: string,
    min: number,
    max: number,
    withscores: 'WITHSCORES'
  ): Promise<string[]>;
  hset(key: string, field: string, value: string): Promise<number>;
  hget(key: string, field: string): Promise<string | null>;
  hdel(key: string, ...fields: string[]): Promise<number>;
}

interface QueueLock {
  release(): Promise<unknown>;
}
interface QueueRedlock {
  acquire(
    resources: string[],
    duration: number,
    opts?: { retryCount?: number }
  ): Promise<QueueLock>;
}

export interface MatchmakingDeps {
  redis: QueueRedis;
  redlock: QueueRedlock;
  /** Create the battle two matched players will join; returns its id + slug. */
  createBattle: (aId: string, bId: string) => Promise<{ battleId: string; slug: string }>;
  /** Current Elo for a player (defaults to DEFAULT_RATING when unrated). */
  getRating: (userId: string) => Promise<number>;
  /** Notify a (typically waiting) player that they were matched. */
  notify: (userId: string, event: string, data: unknown) => void;
  /** Injectable clock for deterministic tests. */
  now: () => number;
}

const battleRepo = new BattleRepository();

const defaultDeps: MatchmakingDeps = {
  redis: defaultRedis as unknown as QueueRedis,
  redlock: defaultRedlock as unknown as QueueRedlock,
  createBattle: async (aId) => {
    const battle = await battleRepo.createBattle({
      title: 'Ranked Match',
      type: 'QUICK',
      difficulty: 'MEDIUM',
      max_participants: 2,
      total_questions: 5,
      time_per_question: 30,
      points_per_question: 100,
      user_id: aId,
    });
    return { battleId: battle.id, slug: battle.slug };
  },
  getRating: async (userId) => {
    const row = await prisma.userRating.findUnique({
      where: { user_id: userId },
    });
    return row?.rating ?? DEFAULT_RATING;
  },
  notify: (userId, event, data) => {
    const battleId = (data as { battleId?: string })?.battleId ?? '';
    void socketService.emitToUser(battleId, userId, event, data);
  },
  now: () => Date.now(),
};

export class MatchmakingService {
  private readonly d: MatchmakingDeps;

  constructor(deps: Partial<MatchmakingDeps> = {}) {
    this.d = { ...defaultDeps, ...deps };
  }

  /** Join the queue, then immediately attempt a match. */
  async joinQueue(userId: string): Promise<MatchResult> {
    const rating = await this.d.getRating(userId);
    await this.d.redis.zadd(QUEUE_KEY, rating, userId);
    await this.d.redis.hset(META_KEY, userId, String(this.d.now()));
    return this.tryMatch(userId);
  }

  async leaveQueue(userId: string): Promise<void> {
    await this.d.redis.zrem(QUEUE_KEY, userId);
    await this.d.redis.hdel(META_KEY, userId);
  }

  async getStatus(userId: string): Promise<QueueStatus> {
    const score = await this.d.redis.zscore(QUEUE_KEY, userId);
    const queueSize = await this.d.redis.zcard(QUEUE_KEY);
    return {
      inQueue: score !== null,
      queueSize,
      rating: score !== null ? Number(score) : null,
    };
  }

  private computeBand(enqueuedAtMs: number): number {
    const waitedSec = Math.max(0, (this.d.now() - enqueuedAtMs) / 1000);
    return Math.min(MAX_BAND, BASE_BAND + waitedSec * BAND_PER_SECOND);
  }

  /** Parse ZRANGEBYSCORE ... WITHSCORES output and pick the closest opponent. */
  private pickNearest(
    raw: string[],
    selfId: string,
    rating: number
  ): { userId: string; rating: number } | null {
    let best: { userId: string; rating: number } | null = null;
    for (let i = 0; i < raw.length; i += 2) {
      const candidateId = raw[i];
      const candidateRating = Number(raw[i + 1]);
      if (candidateId === selfId) continue;
      if (!best || Math.abs(candidateRating - rating) < Math.abs(best.rating - rating)) {
        best = { userId: candidateId, rating: candidateRating };
      }
    }
    return best;
  }

  /** Try to pair `userId` with the nearest waiting player within the band. */
  async tryMatch(userId: string): Promise<MatchResult> {
    const scoreStr = await this.d.redis.zscore(QUEUE_KEY, userId);
    if (scoreStr === null) return { matched: false }; // not queued

    const rating = Number(scoreStr);
    const enqueuedAtStr = await this.d.redis.hget(META_KEY, userId);
    const band = this.computeBand(
      enqueuedAtStr ? Number(enqueuedAtStr) : this.d.now()
    );

    const raw = await this.d.redis.zrangebyscore(
      QUEUE_KEY,
      rating - band,
      rating + band,
      'WITHSCORES'
    );
    const opponent = this.pickNearest(raw, userId, rating);
    if (!opponent) return { matched: false };

    // Deterministic lock order on both players → no deadlock, no double-book.
    const [k1, k2] = [userId, opponent.userId].sort();
    const lockKeys = [`mm:lock:${k1}`, `mm:lock:${k2}`];

    let lock: QueueLock;
    try {
      lock = await this.d.redlock.acquire(lockKeys, LOCK_TTL_MS, {
        retryCount: 0,
      });
    } catch {
      // Someone else is mid-match on one of these players — let them have it.
      return { matched: false };
    }

    try {
      // Race guard: both must still be queued now that we hold the lock.
      const [s1, s2] = await Promise.all([
        this.d.redis.zscore(QUEUE_KEY, userId),
        this.d.redis.zscore(QUEUE_KEY, opponent.userId),
      ]);
      if (s1 === null || s2 === null) return { matched: false };

      await this.d.redis.zrem(QUEUE_KEY, userId, opponent.userId);
      await this.d.redis.hdel(META_KEY, userId, opponent.userId);

      const battle = await this.d.createBattle(userId, opponent.userId);

      // The caller gets the result inline; the waiter learns via their socket.
      this.d.notify(opponent.userId, 'matchmaking:matched', {
        battleId: battle.battleId,
        slug: battle.slug,
        opponentId: userId,
      });

      return {
        matched: true,
        battleId: battle.battleId,
        slug: battle.slug,
        opponentId: opponent.userId,
      };
    } finally {
      await lock.release().catch((err: unknown) => {
        logger.warn('matchmaking lock release failed', { err });
      });
    }
  }
}
