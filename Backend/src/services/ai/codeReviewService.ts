/**
 * AI Code Review — the first feature riding Spine A.
 *
 * Turns a user's code submission (+ the problem and the execution verdict) into a
 * structured, schema-validated review: correctness, time/space complexity, edge
 * cases missed, concrete improvements, and a 0–100 score. Pure orchestration —
 * no DB access here, so it's fully unit-testable with a mocked provider.
 */

import { createHash } from 'node:crypto';
import { z } from 'zod';
import { generateStructured } from './llmService.js';

export const AiCodeReviewSchema = z.object({
  summary: z.string().min(1),
  correctness: z.object({
    verdict: z.enum(['correct', 'incorrect', 'partially_correct', 'uncertain']),
    explanation: z.string(),
  }),
  complexity: z.object({
    time: z.string(),
    space: z.string(),
  }),
  edge_cases_missed: z.array(z.string()),
  improvements: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
    })
  ),
  score: z.number().min(0).max(100),
});

export type AiCodeReview = z.infer<typeof AiCodeReviewSchema>;

export interface CodeReviewInput {
  code: string;
  language: string;
  problemTitle: string;
  problemStatement: string;
  /** Optional verdict from the code executor, to ground the review in reality. */
  executionSummary?: {
    status: string;
    passedCount?: number;
    totalCount?: number;
    runtimeMs?: number;
    memoryKb?: number;
  };
}

/** Stable key so an identical submission reuses the cached review (no spend). */
export function buildReviewCacheKey(input: CodeReviewInput): string {
  const fingerprint = `${input.language}::${input.problemTitle}::${input.code}`;
  return `code-review:${createHash('sha256').update(fingerprint).digest('hex')}`;
}

function buildPrompt(input: CodeReviewInput): string {
  const exec = input.executionSummary
    ? `\nExecution verdict: status=${input.executionSummary.status}` +
      (input.executionSummary.passedCount != null &&
      input.executionSummary.totalCount != null
        ? `, tests=${input.executionSummary.passedCount}/${input.executionSummary.totalCount}`
        : '') +
      (input.executionSummary.runtimeMs != null
        ? `, runtime=${input.executionSummary.runtimeMs}ms`
        : '') +
      (input.executionSummary.memoryKb != null
        ? `, memory=${input.executionSummary.memoryKb}kb`
        : '')
    : '';

  return `You are a senior engineer reviewing a candidate's solution to a coding problem. Be precise, fair, and concrete — point to real issues, not generic advice.

Problem: ${input.problemTitle}
${input.problemStatement}
${exec}

Language: ${input.language}
Submitted code:
\`\`\`${input.language}
${input.code}
\`\`\`

Return ONLY a JSON object with EXACTLY this shape:
{
  "summary": "one or two sentences on the overall quality",
  "correctness": { "verdict": "correct | incorrect | partially_correct | uncertain", "explanation": "why" },
  "complexity": { "time": "Big-O, e.g. O(n log n)", "space": "Big-O" },
  "edge_cases_missed": ["short description", "..."],
  "improvements": [ { "title": "short", "detail": "actionable specifics" } ],
  "score": 0
}
Rules: score is an integer 0–100 reflecting correctness, efficiency, and clarity. If the execution verdict shows failing tests, the verdict must not be "correct". edge_cases_missed and improvements may be empty arrays. No markdown, no commentary — JSON only.`;
}

/** Produce a schema-validated AI review for one submission. */
export async function reviewCodeSubmission(
  input: CodeReviewInput,
  userId?: string | null
): Promise<AiCodeReview> {
  return generateStructured<AiCodeReview>({
    cacheKey: buildReviewCacheKey(input),
    cachePrefix: 'ai-review',
    prompt: buildPrompt(input),
    schema: AiCodeReviewSchema,
    userId,
  });
}
