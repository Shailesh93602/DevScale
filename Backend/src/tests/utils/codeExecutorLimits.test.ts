/**
 * Judge0 answers 422 to a cpu_time_limit or memory_limit above its maximums,
 * and that rejection counts against the breaker every user shares.
 */
import { describe, it, expect, jest } from '@jest/globals';

type Fn = (...args: unknown[]) => Promise<unknown>;
const post = jest.fn<Fn>(async () => ({ data: { token: 't1' } }));
const get = jest.fn<Fn>(async () => ({
  data: { status: { id: 3 }, stdout: null, time: '0.01', memory: 100 },
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: (...a: unknown[]) => post(...a),
    get: (...a: unknown[]) => get(...a),
    isAxiosError: () => false,
  },
}));

import {
  executeCode,
  JUDGE0_MAX_CPU_SECONDS,
  JUDGE0_MAX_MEMORY_KB,
} from '../../utils/codeExecutor';

describe('executeCode limits', () => {
  it('never sends Judge0 a limit above its maximum', async () => {
    await executeCode({
      code: 'print(1)',
      language: 'python',
      input: '',
      timeLimit: 2000,
      memoryLimit: 10_000_000,
    });
    const body = post.mock.calls[0][1] as {
      cpu_time_limit: number;
      memory_limit: number;
    };
    expect(body.cpu_time_limit).toBe(JUDGE0_MAX_CPU_SECONDS);
    expect(body.memory_limit).toBe(JUDGE0_MAX_MEMORY_KB);
  });
});
