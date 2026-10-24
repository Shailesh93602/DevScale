/**
 * eduscale-backend#22-04 — POST /progress/update paid points on every call.
 *
 * Each `status: completed` call ran an unconditional `points: { increment }`
 * with a client-chosen `score`, and overwrote time_spent with 0. Points are
 * now fixed on the server and paid only on the not-completed -> completed
 * first completion, recorded by `points_awarded` in a conditional updateMany
 * so it happens once — while un-completing still really un-completes.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { runHandler } from '../helpers/runHandler';

// An in-memory UserProgress table with the semantics the repository relies on.
type Row = {
  is_completed: boolean;
  time_spent: number;
  points_awarded: boolean;
};
const rows = new Map<string, Row>();
const pointsUpserts: Array<{ update: unknown; create: unknown }> = [];
const key = (w: { user_id: string; topic_id: string }) =>
  `${w.user_id}:${w.topic_id}`;

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    userProgress: {
      updateMany: async ({
        where: { user_id, topic_id, ...cond },
        data,
      }: {
        where: { user_id: string; topic_id: string } & Partial<Row>;
        data: Partial<Row>;
      }) => {
        const row = rows.get(key({ user_id, topic_id }));
        const matches =
          row &&
          Object.entries(cond).every(([k, v]) => row[k as keyof Row] === v);
        if (!matches) return { count: 0 };
        Object.assign(row, data);
        return { count: 1 };
      },
      create: async ({
        data,
      }: {
        data: {
          user_id: string;
          topic_id: string;
          is_completed: boolean;
          time_spent: number;
          points_awarded?: boolean;
        };
      }) => {
        if (rows.has(key(data)))
          throw Object.assign(new Error('dup'), { code: 'P2002' });
        rows.set(key(data), {
          is_completed: data.is_completed,
          time_spent: data.time_spent,
          points_awarded: data.points_awarded ?? false,
        });
        return data;
      },
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { user_id_topic_id: { user_id: string; topic_id: string } };
        create: { is_completed: boolean; time_spent: number };
        update: Record<string, unknown>;
      }) => {
        const k = key(where.user_id_topic_id);
        const row = rows.get(k);
        if (row) Object.assign(row, update);
        else
          rows.set(k, {
            is_completed: create.is_completed,
            time_spent: create.time_spent,
            points_awarded: false,
          });
        return {};
      },
    },
    userPoints: {
      upsert: async (args: { update: unknown; create: unknown }) => {
        pointsUpserts.push(args);
        return {};
      },
    },
  },
}));
jest.mock('../../repositories/dashboard/summaryCache', () => ({
  invalidateDashboardSummary: async () => undefined,
}));

import UserProgressController from '../../controllers/userProgressController';

const controller = new UserProgressController();
const update = (body: Record<string, unknown>) =>
  runHandler(controller.updateProgress, { body, user: { id: 'u1' } as never });

describe('POST /progress/update', () => {
  beforeEach(() => {
    rows.clear();
    pointsUpserts.length = 0;
  });

  it('awards points once per topic, however many times completion is posted', async () => {
    for (let i = 0; i < 5; i++) {
      const out = await update({
        topicId: 't1',
        status: 'completed',
        score: 100,
      });
      expect(out.error).toBeUndefined();
    }
    expect(pointsUpserts).toHaveLength(1);
  });

  it('pays a server-fixed amount, not the client-supplied score', async () => {
    await update({ topicId: 't1', status: 'completed', score: 100 });
    expect(pointsUpserts[0].update).toEqual({ points: { increment: 10 } });
  });

  it('cannot be farmed by toggling completed -> in_progress -> completed', async () => {
    await update({ topicId: 't1', status: 'completed' });
    await update({ topicId: 't1', status: 'in_progress' });
    await update({ topicId: 't1', status: 'completed' });
    expect(pointsUpserts).toHaveLength(1);
    expect(rows.get('u1:t1')?.is_completed).toBe(true);
  });

  it('really marks the topic in progress, as the client is told', async () => {
    await update({ topicId: 't1', status: 'completed' });
    const out = await update({ topicId: 't1', status: 'in_progress' });
    expect(out.error).toBeUndefined();
    expect(rows.get('u1:t1')?.is_completed).toBe(false);
  });

  it('pays once for a topic its quiz already completed', async () => {
    // What quizRepository.updateTopicProgress leaves behind.
    rows.set('u1:t1', {
      is_completed: true,
      time_spent: 0,
      points_awarded: false,
    });
    await update({ topicId: 't1', status: 'completed' });
    await update({ topicId: 't1', status: 'completed' });
    expect(pointsUpserts).toHaveLength(1);
  });

  it('does not overwrite time_spent', async () => {
    rows.set('u1:t1', {
      is_completed: false,
      time_spent: 900,
      points_awarded: false,
    });
    await update({ topicId: 't1', status: 'completed' });
    expect(rows.get('u1:t1')?.time_spent).toBe(900);
  });
});
