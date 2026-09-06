/**
 * What this backend does when a dependency is SLOW rather than down.
 *
 * The existing protections — three circuit breakers, fail-open `catch` blocks on
 * every cache read, a rate limiter wrapped to swallow Redis throws — are all
 * entered by a REJECTION. These cases drive the same code with a dependency that
 * simply never answers, which is the case none of them cover.
 *
 * Assertions are about bounds and about what is released, never about the call
 * being made.
 */
import net from 'node:net';
import Redis from 'ioredis';

import {
  DeadlineExceededError,
  EMBEDDING_TIMEOUT_MS,
  JUDGE0_BREAKER_TIMEOUT_MS,
  JUDGE0_POLL_TIMEOUT_MS,
  JUDGE0_SUBMIT_TIMEOUT_MS,
  LLM_BREAKER_TIMEOUT_MS,
  LLM_CALL_TIMEOUT_MS,
  REDIS_COMMAND_TIMEOUT_MS,
  withDeadline,
} from '../../utils/deadlines';

describe('withDeadline', () => {
  afterEach(() => jest.useRealTimers());

  it('gives up on work that never settles', async () => {
    jest.useFakeTimers();
    const raced = withDeadline(new Promise(() => {}), 5_000, 'test dep');
    const assertion = expect(raced).rejects.toBeInstanceOf(
      DeadlineExceededError
    );

    await jest.advanceTimersByTimeAsync(5_000);
    await assertion;
  });

  it('names the dependency, so a log line is diagnostic', async () => {
    jest.useFakeTimers();
    const raced = withDeadline(
      new Promise<never>(() => {}),
      1_000,
      'supabase auth.getUser'
    );
    const captured = raced.catch((e) => e as DeadlineExceededError);

    await jest.advanceTimersByTimeAsync(1_000);
    const error = await captured;

    expect(error.label).toBe('supabase auth.getUser');
    expect(error.waitedMs).toBe(1_000);
  });

  it('passes work that finishes in time straight through', async () => {
    await expect(
      withDeadline(Promise.resolve('ok'), 1_000, 'fast')
    ).resolves.toBe('ok');
  });

  it("passes the work's own rejection through unchanged", async () => {
    const boom = new Error('upstream 500');
    await expect(
      withDeadline(Promise.reject(boom), 1_000, 'fast')
    ).rejects.toBe(boom);
  });

  it('leaves no timer holding the process open', async () => {
    jest.useFakeTimers();
    await withDeadline(Promise.resolve('ok'), 60_000, 'fast');
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe('a transport timeout must sit UNDER its circuit breaker', () => {
  /**
   * THE invariant for this codebase.
   *
   * `opossum` rejects the breaker's promise at its deadline but cannot cancel
   * the work underneath — it threads no AbortSignal into what it wraps. So a
   * breaker bounds caller latency and NOT socket consumption. If a call's own
   * timeout were larger than its breaker's, the breaker would give up while the
   * request kept running, and under concurrency the process would accumulate
   * in-flight sockets it believes it already abandoned.
   *
   * Asserted as inequalities so moving a breaker's timeout fails here rather
   * than silently leaving a call effectively unbounded.
   */
  it('Judge0 submit aborts before the breaker abandons it', () => {
    expect(JUDGE0_SUBMIT_TIMEOUT_MS).toBeLessThan(JUDGE0_BREAKER_TIMEOUT_MS);
  });

  it('Judge0 poll aborts before the breaker abandons it', () => {
    expect(JUDGE0_POLL_TIMEOUT_MS).toBeLessThan(JUDGE0_BREAKER_TIMEOUT_MS);
  });

  it('a Gemini generate aborts before its per-key breaker abandons it', () => {
    expect(LLM_CALL_TIMEOUT_MS).toBeLessThan(LLM_BREAKER_TIMEOUT_MS);
  });

  it('the embedding call is bounded even though it has no breaker at all', () => {
    // The only Gemini path with nothing in front of it, so this number is the
    // only bound that exists on it. A zero or absent value would mean the SDK
    // attaches no AbortSignal — the default, and the bug.
    expect(EMBEDDING_TIMEOUT_MS).toBeGreaterThan(0);
  });
});

describe('the Redis cache client under a slow-but-connected Redis', () => {
  /**
   * A real ioredis client against a server that completes the handshake and
   * then goes silent. Down is already handled — ECONNREFUSED rejects, and every
   * `catch` fires. This is the case where the socket is healthy and the reply
   * never comes.
   */
  let server: net.Server;
  let url: string;

  beforeAll(async () => {
    server = net.createServer((sock) => {
      sock.on('data', (buf) => {
        const cmd = buf.toString();
        // Enough to reach "ready"...
        if (cmd.includes('INFO')) {
          sock.write('$21\r\nredis_version:7.0.0\r\n\r\n');
        } else if (cmd.includes('COMMAND')) {
          sock.write('*0\r\n');
        }
        // ...and then silence for every real command.
      });
      sock.on('error', () => {});
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
    const address = server.address();
    if (typeof address === 'string' || address === null) {
      throw new Error('expected a TCP address');
    }
    url = `redis://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise((r) => server.close(r));
  });

  const clients: Redis[] = [];
  afterEach(() => {
    for (const c of clients.splice(0)) c.disconnect();
  });

  const connect = (opts: Record<string, unknown>) => {
    const client = new Redis(url, opts);
    client.on('error', () => {});
    clients.push(client);
    return client;
  };

  it('WITHOUT commandTimeout the command never settles — the bug', async () => {
    // maxRetriesPerRequest: null means "retry forever", so there is no
    // rejection. This is what made getCache/getAuthCache/isTokenBlocklisted and
    // the rate limiter's swallow-wrapper unreachable: all four handle a throw,
    // and no throw ever comes.
    const client = connect({ maxRetriesPerRequest: null });

    let settled = false;
    void client.get('k').then(
      () => (settled = true),
      () => (settled = true)
    );
    await new Promise((r) => setTimeout(r, 1_500));

    expect(settled).toBe(false);
  }, 10_000);

  it('WITH commandTimeout it rejects, so the fail-open handlers can run', async () => {
    const client = connect({
      maxRetriesPerRequest: null,
      commandTimeout: 300,
    });

    const started = Date.now();
    await expect(client.get('k')).rejects.toThrow(/timed out/i);
    expect(Date.now() - started).toBeLessThan(5_000);
  }, 10_000);

  it('a fail-open cache read now returns null instead of hanging', async () => {
    // The shape getCache has: await, and fall back on a throw. The point of the
    // timeout is that this function can now REACH its own catch block.
    const client = connect({
      maxRetriesPerRequest: null,
      commandTimeout: 300,
    });

    const getCacheShaped = async (key: string): Promise<string | null> => {
      try {
        return await client.get(key);
      } catch {
        return null;
      }
    };

    await expect(getCacheShaped('k')).resolves.toBeNull();
  }, 10_000);
});

describe('the configured cache client carries the bound', () => {
  it('cacheService constructs its client with a command timeout', async () => {
    // Reads the real module rather than restating the number: the assertion is
    // that the client the APP uses is bounded, not that a constant exists
    // somewhere. Only `.options` is inspected — no command is issued, so this
    // touches no database. jest-setup owns this client's lifecycle and quits it
    // in its own afterAll; disconnecting it here would break every later test
    // sharing the worker.
    const { redis } = await import('../../services/cacheService');

    expect(redis.options.commandTimeout).toBe(REDIS_COMMAND_TIMEOUT_MS);
    // Still required by Redlock — the timeout is what makes it safe to keep.
    expect(redis.options.maxRetriesPerRequest).toBeNull();
  });
});
