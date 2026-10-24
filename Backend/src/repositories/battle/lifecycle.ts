import { BattleStatus } from '../../constants/enums';
import prisma from '../../lib/prisma.js';
import { createAppError } from '../../utils/errorHandler.js';
import { BATTLE_START_LOCK_TTL_MS } from '../../utils/deadlines.js';
import { battleDetailInclude, creatorSelect } from './battleShapes.js';
import { resolveBattleId, withBattleLock } from './lock.js';

// ── Join ────────────────────────────────────────────────────────────────

export async function joinBattle(battleIdOrSlug: string, userId: string) {
  const battleId = await resolveBattleId(battleIdOrSlug);
  return prisma.$transaction(
    async (tx) => {
      const battle = await tx.battle.findUnique({ where: { id: battleId } });
      if (!battle) throw createAppError('Battle not found', 404);
      if (battle.status !== 'WAITING' && battle.status !== 'LOBBY') {
        throw createAppError(
          'Cannot join — battle has already started or ended',
          403
        );
      }

      // Guard: reject if already enrolled
      const existingParticipant = await tx.battleParticipant.findUnique({
        where: {
          battle_id_user_id: { battle_id: battleId, user_id: userId },
        },
      });
      if (existingParticipant) {
        throw createAppError('You are already enrolled in this battle', 409);
      }

      // Conditional claim of a seat: two joiners racing for the last one cannot
      // both pass, unlike a read-then-write capacity check.
      const seat = await tx.battle.updateMany({
        where: {
          id: battleId,
          status: { in: ['WAITING', 'LOBBY'] },
          current_participants: { lt: battle.max_participants },
        },
        data: { current_participants: { increment: 1 } },
      });
      if (seat.count === 0) {
        throw createAppError('Battle is full', 403);
      }

      // The read-then-write guard above is not atomic: two join requests from
      // the same user can both pass it and race into the create, where the
      // (battle_id, user_id) unique index decides the winner. Catch that and
      // report the same 409 the guard would have, instead of leaking a raw
      // Prisma "Unique constraint failed" as a 500.
      const participant = await tx.battleParticipant
        .create({
          data: { battle_id: battleId, user_id: userId, status: 'JOINED' },
          include: { user: { select: creatorSelect } },
        })
        .catch((err: { code?: string }) => {
          if (err?.code === 'P2002') {
            throw createAppError(
              'You are already enrolled in this battle',
              409
            );
          }
          throw err;
        });

      const updated = await tx.battle.findUniqueOrThrow({
        where: { id: battleId },
        include: battleDetailInclude,
      });

      return { participant, battle: updated };
    },
    { timeout: 15_000 }
  );
}

// ── Leave ────────────────────────────────────────────────────────────────

export async function leaveBattle(battleIdOrSlug: string, userId: string) {
  const battleId = await resolveBattleId(battleIdOrSlug);
  return prisma.$transaction(
    async (tx) => {
      const participant = await tx.battleParticipant.findUnique({
        where: {
          battle_id_user_id: { battle_id: battleId, user_id: userId },
        },
      });
      if (!participant) throw createAppError('You are not in this battle', 404);

      const battle = await tx.battle.findUnique({ where: { id: battleId } });
      // A finished battle's rows are its history (stats, win rate); keep them.
      if (battle?.status === 'COMPLETED' || battle?.status === 'CANCELLED') {
        throw createAppError('This battle has already ended', 409);
      }
      if (battle?.status === 'IN_PROGRESS') {
        // Mark as disconnected rather than removing
        await tx.battleParticipant.update({
          where: {
            battle_id_user_id: { battle_id: battleId, user_id: userId },
          },
          data: { status: 'DISCONNECTED', last_seen_at: new Date() },
        });
        return tx.battle.findUnique({ where: { id: battleId } });
      }

      await tx.battleParticipant.delete({
        where: {
          battle_id_user_id: { battle_id: battleId, user_id: userId },
        },
      });

      return tx.battle.update({
        where: { id: battleId },
        data: { current_participants: { decrement: 1 } },
      });
    },
    { timeout: 15_000 }
  );
}

// ── Ready ────────────────────────────────────────────────────────────────

export async function markReady(battleIdOrSlug: string, userId: string) {
  const battleId = await resolveBattleId(battleIdOrSlug);
  const participant = await prisma.battleParticipant.findUnique({
    where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
  });
  if (!participant) throw createAppError('You are not in this battle', 404);
  // Ready is a lobby state. Mid-battle it would turn a COMPLETED player back
  // into one who is not done (so the battle never completes on answers) and a
  // DISCONNECTED leaver back into a player.
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    select: { status: true },
  });
  if (battle?.status !== 'WAITING' && battle?.status !== 'LOBBY') {
    throw createAppError(
      'You can only get ready before the battle starts',
      409
    );
  }
  if (participant.status === 'READY') return participant;

  return prisma.battleParticipant.update({
    where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
    data: { status: 'READY' },
    include: { user: { select: creatorSelect } },
  });
}

// ── Start ────────────────────────────────────────────────────────────────

/**
 * 🔴 EVERY GUARD RUNS INSIDE THE LOCK, AND THE WRITE IS A COMPARE-AND-SET.
 *
 * This used to read the battle, evaluate all five guards — including
 * `status !== 'LOBBY'` — and only then take the lock around a bare
 * `prisma.battle.update`. That is a read-then-write with the lock around the
 * write alone, and it does not prevent anything: two callers both read
 * LOBBY, both pass every guard, then queue politely for the lock and both
 * perform the transition. The lock made the double-start orderly.
 *
 * It was worse than a duplicate `battle:started`, because the update carried
 * no condition at all. A start request that read LOBBY and then stalled could
 * land after the battle had finished and flip a COMPLETED battle back to
 * IN_PROGRESS, stranding its final leaderboard.
 *
 * Two changes, and the second is the one that actually holds: the guards moved
 * inside the lock, and the transition is now `updateMany where status:
 * 'LOBBY'` — a single atomic compare-and-set in Postgres. That is correct even
 * if the lock lapses, which is the property a lock alone can never give you.
 */
export async function startBattle(battleIdOrSlug: string, userId: string) {
  const battleId = await resolveBattleId(battleIdOrSlug);

  return withBattleLock(battleId, BATTLE_START_LOCK_TTL_MS, async () => {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        participants: true,
        _count: { select: { questions: true } },
      },
    });
    if (!battle) throw createAppError('Battle not found', 404);
    if (battle.user_id !== userId)
      throw createAppError('Only the creator can start this battle', 403);
    if (battle.status !== 'LOBBY')
      throw createAppError('Battle must be in LOBBY state to start', 400);
    if (battle.current_participants < 2)
      throw createAppError('Need at least 2 participants to start', 400);

    const readyCount = battle.participants.filter(
      (p) => p.status === 'READY'
    ).length;
    if (readyCount < battle.current_participants) {
      throw createAppError('Not all participants are ready', 400);
    }

    // Guard: cannot start without the required number of questions
    if (battle._count.questions < battle.total_questions) {
      throw createAppError(
        `Battle needs ${battle.total_questions} questions but only has ${battle._count.questions}. Add questions before starting.`,
        400
      );
    }

    const claimed = await prisma.battle.updateMany({
      where: { id: battleId, status: 'LOBBY' },
      data: { status: 'IN_PROGRESS' },
    });
    if (claimed.count === 0) {
      throw createAppError('This battle has already been started.', 409);
    }

    return prisma.battle.findUniqueOrThrow({
      where: { id: battleId },
      include: battleDetailInclude,
    });
  });
}

// ── Cancel ────────────────────────────────────────────────────────────────

export async function cancelBattle(battleIdOrSlug: string, userId: string) {
  const battleId = await resolveBattleId(battleIdOrSlug);
  const battle = await prisma.battle.findUnique({ where: { id: battleId } });
  if (!battle) throw createAppError('Battle not found', 404);
  if (battle.user_id !== userId)
    throw createAppError('Only the creator can cancel this battle', 403);
  if (battle.status === 'IN_PROGRESS' || battle.status === 'COMPLETED') {
    throw createAppError(
      'Cannot cancel a battle that has already started or completed',
      400
    );
  }
  if (battle.status === 'CANCELLED')
    throw createAppError('Battle is already cancelled', 400);

  return prisma.battle.update({
    where: { id: battleId },
    data: { status: 'CANCELLED' },
  });
}

// ── Status transition ─────────────────────────────────────────────────────

export async function updateStatus(
  battleIdOrSlug: string,
  userId: string,
  newStatus: BattleStatus
) {
  const battleId = await resolveBattleId(battleIdOrSlug);
  const battle = await prisma.battle.findUnique({ where: { id: battleId } });
  if (!battle) throw createAppError('Battle not found', 404);
  if (battle.user_id !== userId)
    throw createAppError('Only the creator can update battle status', 403);

  const allowed: Record<string, string[]> = {
    WAITING: ['LOBBY', 'CANCELLED'],
    LOBBY: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (!allowed[battle.status]?.includes(newStatus)) {
    throw createAppError(
      `Invalid transition: ${battle.status} → ${newStatus}`,
      400
    );
  }

  return prisma.battle.update({
    where: { id: battleId },
    data: {
      status: newStatus,
      ...(newStatus === 'COMPLETED' ? { ended_at: new Date() } : {}),
    },
  });
}
