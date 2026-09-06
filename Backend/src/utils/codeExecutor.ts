import axios from 'axios';
import CircuitBreaker from 'opossum';
import { COMPILER_CLIENT_SECRET } from '../config';
import logger from './logger';
import { createAppError } from './errorHandler';
import {
  JUDGE0_BREAKER_TIMEOUT_MS,
  JUDGE0_POLL_TIMEOUT_MS,
  JUDGE0_SUBMIT_TIMEOUT_MS,
} from './deadlines';

interface ExecuteCodeParams {
  code: string;
  language: string;
  input: string;
  timeLimit?: number;
  memoryLimit?: number;
}

interface ExecutionResult {
  output: string;
  executionTime: number;
  memoryUsed: number;
}

// ─── Circuit Breaker ──────────────────────────────────────────────────────────
// Opens after 3 failures in a 10-second window; half-opens after 30 seconds.
// Prevents cascading timeouts when Judge0 / RapidAPI is degraded.
// 🔴 The breaker's timeout is NOT the request's timeout. opossum rejects the
// caller's promise at its deadline but cannot cancel the work underneath — it
// threads no AbortSignal into what it wraps. So without the axios timeouts
// below, a slow Judge0 freed the caller at 15 s while the sockets kept running
// to completion, and the breaker counted as "given up" requests that were still
// consuming connections. Both transport timeouts are held UNDER this ceiling by
// deadlines.test.ts, so the request aborts before the breaker abandons it.
const judge0Breaker = new CircuitBreaker(_executeCodeRaw, {
  timeout: JUDGE0_BREAKER_TIMEOUT_MS, // 15 s — Judge0 slow-path ceiling
  errorThresholdPercentage: 50, // open when ≥50% of calls in window fail
  resetTimeout: 30000, // try again after 30 s
  volumeThreshold: 3, // need at least 3 calls before opening
  name: 'judge0',
});

judge0Breaker.on('open', () =>
  logger.warn('Judge0 circuit breaker OPEN — requests failing fast')
);
judge0Breaker.on('halfOpen', () =>
  logger.info('Judge0 circuit breaker HALF-OPEN — probing')
);
judge0Breaker.on('close', () =>
  logger.info('Judge0 circuit breaker CLOSED — service recovered')
);

export const executeCode = async (
  params: ExecuteCodeParams
): Promise<ExecutionResult> => {
  try {
    return await judge0Breaker.fire(params);
  } catch (error) {
    if (judge0Breaker.opened) {
      throw createAppError(
        'Code execution is temporarily unavailable — please try again in a moment.',
        503
      );
    }
    throw error;
  }
};

async function _executeCodeRaw(
  params: ExecuteCodeParams
): Promise<ExecutionResult> {
  try {
    // Using Judge0 API for code execution with base64 encoding for stability
    const response = await axios.post(
      'https://judge029.p.rapidapi.com/submissions?base64_encoded=true',
      {
        source_code: Buffer.from(params.code).toString('base64'),
        language_id: getLanguageId(params.language),
        stdin: Buffer.from(params.input).toString('base64'),
        cpu_time_limit: params.timeLimit || 2,
        memory_limit: params.memoryLimit || 128000,
      },
      {
        headers: {
          'X-RapidAPI-Host': 'judge029.p.rapidapi.com',
          'X-RapidAPI-Key': COMPILER_CLIENT_SECRET,
        },
        timeout: JUDGE0_SUBMIT_TIMEOUT_MS,
      }
    );

    const { token } = response.data;

    // Poll for results
    const result = await pollSubmissionResult(token);

    // Decode base64 results
    const decode = (str: string | null) =>
      str ? Buffer.from(str, 'base64').toString('utf-8') : '';

    const stdout = decode(result.stdout);
    const stderr = decode(result.stderr);
    const compileOutput = decode(result.compile_output);
    const message = result.message ? decode(result.message) : '';

    const combinedOutput = [compileOutput, stdout, stderr, message]
      .filter(Boolean)
      .join('\n')
      .trim();

    return {
      output: combinedOutput || 'Execution completed with no output.',
      executionTime: result.time,
      memoryUsed: result.memory,
    };
  } catch (error: unknown) {
    logger.error('Code execution error:', error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw createAppError(
        'Code execution API key is missing or invalid. Please check your Backend .env file.',
        401
      );
    }

    const message =
      (axios.isAxiosError(error)
        ? error.response?.data?.error || error.response?.data?.message
        : (error as Error).message) || 'Failed to execute code';
    throw createAppError(`Code Execution Error: ${message}`, 500);
  }
}

const pollSubmissionResult = async (token: string, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await axios.get(
      `https://judge029.p.rapidapi.com/submissions/${token}?base64_encoded=true`,
      {
        headers: {
          'X-RapidAPI-Host': 'judge029.p.rapidapi.com',
          'X-RapidAPI-Key': COMPILER_CLIENT_SECRET,
        },
        timeout: JUDGE0_POLL_TIMEOUT_MS,
      }
    );

    if (response.data.status.id >= 3) {
      return response.data;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw createAppError('Code execution timeout', 408);
};

const getLanguageId = (language: string): number => {
  const languageMap: Record<string, number> = {
    javascript: 63,
    python: 71,
    java: 62,
    cpp: 54,
    go: 60,
  };

  const id = languageMap[language.toLowerCase()];
  if (!id) {
    throw createAppError('Unsupported programming language', 400);
  }

  return id;
};
