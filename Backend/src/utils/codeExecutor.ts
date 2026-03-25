import axios from 'axios';
import { COMPILER_CLIENT_SECRET } from '../config';
import logger from './logger';
import { createAppError } from './errorHandler';

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

export const executeCode = async (
  params: ExecuteCodeParams
): Promise<ExecutionResult> => {
  try {
    // Using Judge0 API for code execution
    const response = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions',
      {
        source_code: params.code,
        language_id: getLanguageId(params.language),
        stdin: params.input,
        cpu_time_limit: params.timeLimit || 2,
        memory_limit: params.memoryLimit || 128000,
      },
      {
        headers: {
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': COMPILER_CLIENT_SECRET,
        },
      }
    );

    const { token } = response.data;

    // Poll for results
    const result = await pollSubmissionResult(token);

    return {
      output: result.stdout || result.stderr || '',
      executionTime: result.time,
      memoryUsed: result.memory,
    };
  } catch (error) {
    logger.error('Code execution error:', error);
    throw createAppError('Failed to execute code', 500);
  }
};

const pollSubmissionResult = async (token: string, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await axios.get(
      `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
      {
        headers: {
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': COMPILER_CLIENT_SECRET,
        },
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
    // Add more languages as needed
  };

  const id = languageMap[language.toLowerCase()];
  if (!id) {
    throw createAppError('Unsupported programming language', 400);
  }

  return id;
};
