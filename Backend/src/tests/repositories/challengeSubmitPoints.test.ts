// eduscale-backend#23-02 / #27-02 — challenge submissions pay once and run the wrapped program.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

type Fn = (...args: unknown[]) => Promise<unknown>;
const challengeRow = {
  id: 'c1',
  status: 'ACTIVE',
  difficulty: 'EASY',
  time_limit: 2000,
  memory_limit: 1000,
  function_signature: 'function add(a, b)',
};
const db = {
  challenge: { findUnique: jest.fn<Fn>() },
  testCase: { findMany: jest.fn<Fn>() },
  challengeSubmission: {
    findFirst: jest.fn<Fn>(),
    create: jest.fn<Fn>(async (a) => (a as { data: unknown }).data),
  },
  userPoints: { upsert: jest.fn<Fn>() },
  $executeRaw: jest.fn<Fn>(async () => 1),
};
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: { ...db, $transaction: (fn: (tx: typeof db) => unknown) => fn(db) },
}));
const executeCode = jest.fn<Fn>(async () => ({
  output: '5',
  executionTime: 1,
  memoryUsed: 1,
}));
jest.mock('../../utils/codeExecutor', () => ({
  executeCode: (...a: unknown[]) => executeCode(...a),
}));
jest.mock('../../services/cacheService', () => ({
  invalidateCachePattern: async () => undefined,
}));

import { ChallengeRepository } from '../../repositories/challengeRepository';

const submit = () =>
  new ChallengeRepository().submitChallenge({
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
    user_id: 'u1',
    challenge_id: 'c1',
  } as never);

beforeEach(() => {
  jest.clearAllMocks();
  db.challenge.findUnique.mockResolvedValue(challengeRow);
  db.testCase.findMany.mockResolvedValue([
    { input: '{"a":2,"b":3}', output: '5' },
  ]);
  db.challengeSubmission.findFirst.mockResolvedValue(null);
});

describe('ChallengeRepository.submitChallenge', () => {
  it('pays points on the first accepted submission', async () => {
    await submit();
    expect(db.userPoints.upsert).toHaveBeenCalledTimes(1);
  });

  it('does not pay again for a challenge the user already solved', async () => {
    db.challengeSubmission.findFirst.mockResolvedValue({ id: 'earlier' });
    const submission = (await submit()) as { status: string };
    expect(submission.status).toBe('accepted');
    expect(db.userPoints.upsert).not.toHaveBeenCalled();
  });

  it('refuses a challenge with no test cases instead of accepting any code', async () => {
    db.testCase.findMany.mockResolvedValue([]);
    await expect(submit()).rejects.toMatchObject({ statusCode: 400 });
    expect(db.userPoints.upsert).not.toHaveBeenCalled();
  });

  it('refuses an archived challenge', async () => {
    db.challenge.findUnique.mockResolvedValue({
      ...challengeRow,
      status: 'ARCHIVED',
    });
    await expect(submit()).rejects.toMatchObject({ statusCode: 400 });
    expect(executeCode).not.toHaveBeenCalled();
  });

  it('executes the same wrapped program that Run executes', async () => {
    await submit();
    const sent = (executeCode.mock.calls[0][0] as { code: string }).code;
    expect(sent).toContain('__harnessArgs');
  });

  it("sends Judge0 the challenge's time limit in seconds, not milliseconds", async () => {
    await submit();
    const sent = executeCode.mock.calls[0][0] as { timeLimit: number };
    // time_limit is stored as 2000 ms; cpu_time_limit is seconds.
    expect(sent.timeLimit).toBe(2);
  });
});
