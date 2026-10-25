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

import {
  redis as defaultRedis,
  redlock as defaultRedlock,
} from '../cacheService.js';
import { BattleRepository } from '../../repositories/battleRepository.js';
import socketService from '../socket.js';
import prisma from '../../lib/prisma.js';
import { DEFAULT_RATING } from '../rating/ratingMath.js';
import logger from '../../utils/logger.js';
import { createAppError } from '../../utils/errorHandler.js';
import { getRandomPoolQuestions } from '../questionPoolService.js';
import battleSocketService from '../battleSocket.js';
import { isMatchmakingAutoStartEnabled } from '../../config/featureFlags.js';

const QUEUE_KEY = 'matchmaking:queue:quick';
const META_KEY = 'matchmaking:meta:quick';
// Last time each queued player was seen (join or a status poll, every ~3 s).
const SEEN_KEY = 'matchmaking:seen:quick';
const STALE_AFTER_MS = 30_000;
// A waiter's match, so /status delivers it if the socket push was missed. Cleared on join/leave.
const MATCHED_KEY = 'matchmaking:matched:quick';
const MATCH_REPLAY_MS = 120_000;
const BASE_BAND = 100; // rating points
const BAND_PER_SECOND = 20; // widen while waiting
const MAX_BAND = 600;
const LOCK_TTL_MS = 5000;
const RANKED_QUESTIONS = 5;
/** Auto-start countdown: time for both players to reach the battle page. */
export const AUTO_START_COUNTDOWN_MS = 10_000;

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
  /** Set when this player was matched while waiting (the socket push may have been missed). */
  match?: MatchResult;
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
  createBattle: (
    aId: string,
    bId: string
  ) => Promise<{ battleId: string; slug: string }>;
  /** Current Elo for a player (defaults to DEFAULT_RATING when unrated). */
  getRating: (userId: string) => Promise<number>;
  /** Notify a (typically waiting) player that they were matched. */
  notify: (userId: string, event: string, data: unknown) => void;
  /** MATCHMAKING_AUTO_START, read per match. */
  autoStartEnabled: () => boolean;
  /** Ready both seats and arm the start; false when the battle's guard refused. */
  autoStart: (battleId: string) => Promise<boolean>;
  /** Injectable clock for deterministic tests. */
  now: () => number;
}

const battleRepo = new BattleRepository();

const defaultDeps: MatchmakingDeps = {
  redis: defaultRedis as unknown as QueueRedis,
  redlock: defaultRedlock as unknown as QueueRedlock,
  createBattle: async (aId, bId) => {
    // Without questions startBattle refuses (_count.questions <
    // total_questions), and without seats a third user could take a matched
    // player's place — so both go into the same INSERT as the battle.
    const questions = await getRandomPoolQuestions(RANKED_QUESTIONS);
    if (questions.length < RANKED_QUESTIONS) {
      throw createAppError('Not enough questions for a ranked match', 503);
    }
    const battle = await battleRepo.createBattle({
      title: 'Ranked Match',
      type: 'QUICK',
      difficulty: 'MEDIUM',
      max_participants: 2,
      total_questions: RANKED_QUESTIONS,
      time_per_question: 30,
      points_per_question: 100,
      user_id: aId,
      participant_ids: [aId, bId],
      pool_questions: questions,
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
  autoStartEnabled: isMatchmakingAutoStartEnabled,
  autoStart: async (battleId) => {
    const ready = await battleRepo.autoReadyMatchedBattle(battleId);
    if (ready) {
      battleSocketService.scheduleAutoStart(
        battleId,
        Date.now() + AUTO_START_COUNTDOWN_MS
      );
    }
    return ready;
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
    await this.d.redis.hdel(MATCHED_KEY, userId);
    await this.d.redis.zadd(QUEUE_KEY, rating, userId);
    await this.d.redis.hset(META_KEY, userId, String(this.d.now()));
    await this.d.redis.hset(SEEN_KEY, userId, String(this.d.now()));
    return this.tryMatch(userId);
  }

  async leaveQueue(userId: string): Promise<void> {
    await this.d.redis.zrem(QUEUE_KEY, userId);
    await this.d.redis.hdel(META_KEY, userId);
    await this.d.redis.hdel(SEEN_KEY, userId);
    await this.d.redis.hdel(MATCHED_KEY, userId);
  }

  async getStatus(userId: string): Promise<QueueStatus> {
    const score = await this.d.redis.zscore(QUEUE_KEY, userId);
    if (score !== null) {
      await this.d.redis.hset(SEEN_KEY, userId, String(this.d.now()));
    }
    const queueSize = await this.d.redis.zcard(QUEUE_KEY);
    const status: QueueStatus = {
      inQueue: score !== null,
      queueSize,
      rating: score !== null ? Number(score) : null,
    };
    if (score === null) {
      const match = await this.recentMatch(userId);
      if (match) status.match = match;
    }
    return status;
  }

  private async recentMatch(userId: string): Promise<MatchResult | null> {
    const raw = await this.d.redis.hget(MATCHED_KEY, userId);
    if (!raw) return null;
    try {
      const { at, ...match } = JSON.parse(raw) as MatchResult & { at: number };
      if (typeof at === 'number' && this.d.now() - at <= MATCH_REPLAY_MS) {
        return match;
      }
    } catch {
      // unreadable entry: drop it below
    }
    await this.d.redis.hdel(MATCHED_KEY, userId);
    return null;
  }

  private computeBand(enqueuedAtMs: number): number {
    const waitedSec = Math.max(0, (this.d.now() - enqueuedAtMs) / 1000);
    return Math.min(MAX_BAND, BASE_BAND + waitedSec * BAND_PER_SECOND);
  }

  /**
   * Closest opponent from ZRANGEBYSCORE ... WITHSCORES output who is still
   * polling; a player who closed the tab is evicted rather than matched.
   */
  private async pickNearest(
    raw: string[],
    selfId: string,
    rating: number
  ): Promise<{ userId: string; rating: number } | null> {
    const candidates: { userId: string; rating: number }[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      if (raw[i] !== selfId) {
        candidates.push({ userId: raw[i], rating: Number(raw[i + 1]) });
      }
    }
    candidates.sort(
      (a, b) => Math.abs(a.rating - rating) - Math.abs(b.rating - rating)
    );
    for (const candidate of candidates) {
      const seen =
        (await this.d.redis.hget(SEEN_KEY, candidate.userId)) ??
        (await this.d.redis.hget(META_KEY, candidate.userId));
      if (seen && this.d.now() - Number(seen) <= STALE_AFTER_MS) {
        return candidate;
      }
      await this.leaveQueue(candidate.userId);
    }
    return null;
  }

  /** A failed auto-start leaves the battle in the manual lobby flow; the match stands. */
  private async startMatched(battleId: string): Promise<void> {
    try {
      const started = await this.d.autoStart(battleId);
      if (!started) logger.warn(`auto-start refused for battle ${battleId}`);
    } catch (err) {
      logger.error(`auto-start failed for battle ${battleId}`, { err });
    }
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
    const opponent = await this.pickNearest(raw, userId, rating);
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

      const opponentEnqueuedAt = await this.d.redis.hget(
        META_KEY,
        opponent.userId
      );
      await this.d.redis.zrem(QUEUE_KEY, userId, opponent.userId);
      await this.d.redis.hdel(META_KEY, userId, opponent.userId);
      await this.d.redis.hdel(SEEN_KEY, userId, opponent.userId);

      let battle: { battleId: string; slug: string };
      try {
        battle = await this.d.createBattle(userId, opponent.userId);
      } catch (err) {
        // No battle, so nobody was matched: put both players back exactly as
        // they were, or the waiter silently drops out of matchmaking.
        const now = String(this.d.now());
        await this.d.redis.zadd(QUEUE_KEY, Number(s1), userId);
        await this.d.redis.hset(META_KEY, userId, enqueuedAtStr ?? now);
        await this.d.redis.zadd(QUEUE_KEY, Number(s2), opponent.userId);
        await this.d.redis.hset(
          META_KEY,
          opponent.userId,
          opponentEnqueuedAt ?? now
        );
        await this.d.redis.hset(SEEN_KEY, userId, now);
        await this.d.redis.hset(SEEN_KEY, opponent.userId, now);
        throw err;
      }

      if (this.d.autoStartEnabled()) {
        await this.startMatched(battle.battleId);
      }

      // The caller gets the result inline; the waiter learns via their socket,
      // or via /status if that push was missed.
      const waiterMatch: MatchResult = {
        matched: true,
        battleId: battle.battleId,
        slug: battle.slug,
        opponentId: userId,
      };
      this.d.notify(opponent.userId, 'matchmaking:matched', waiterMatch);
      // Best effort: the battle exists and the joiner is told inline either way.
      await this.d.redis
        .hset(
          MATCHED_KEY,
          opponent.userId,
          JSON.stringify({ ...waiterMatch, at: this.d.now() })
        )
        .catch((err: unknown) => {
          logger.warn('matchmaking match replay not stored', { err });
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
