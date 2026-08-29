/**
 * AI Tutor (Feature 3) — RAG over the platform's own content (Spine B) + the LLM
 * layer (Spine A). Two modes:
 *   • answerQuestion: grounded concept answer with citations + an honest
 *     "I don't know" guardrail when retrieval is too weak (no hallucination, no
 *     LLM spend in that case).
 *   • getHint: progressive, level-gated hints for a challenge that never reveal
 *     the full solution.
 *
 * Pure orchestration over injectable/ mockable collaborators — unit-tested with
 * no network or DB.
 */

import { createHash } from 'node:crypto';
import { z } from 'zod';
import prisma from '../../lib/prisma.js';
import { embedText } from './embeddingService.js';
import { ContentEmbeddingRepository } from '../../repositories/contentEmbeddingRepository.js';
import { generateStructured } from './llmService.js';
import { createAppError } from '../../utils/errorHandler.js';

// pgvector cosine distance: 0 = identical, 2 = opposite. Above this the best
// match is too unrelated to ground an answer → fall back to "I don't know".
const RELEVANCE_DISTANCE_THRESHOLD = 0.6;
const RETRIEVE_LIMIT = 4;
const MAX_HINT_LEVEL = 4;
const CONTENT_TYPE = 'challenge';

export const TutorAnswerSchema = z.object({
  answer: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
  used_context: z.boolean(),
  citations: z.array(z.object({ title: z.string(), content_id: z.string() })),
});
export type TutorAnswer = z.infer<typeof TutorAnswerSchema>;

export const TutorHintSchema = z.object({
  hint: z.string(),
  level: z.number(),
  reveals_full_solution: z.boolean(),
});
export type TutorHint = z.infer<typeof TutorHintSchema>;

interface RetrievedItem {
  contentId: string;
  title: string;
  text: string;
  distance: number;
}

export class TutorService {
  private readonly repo: ContentEmbeddingRepository;

  constructor(
    repo: ContentEmbeddingRepository = new ContentEmbeddingRepository()
  ) {
    this.repo = repo;
  }

  /** Embed the query, find nearest challenges, and hydrate their text. */
  async retrieveContext(
    query: string,
    limit = RETRIEVE_LIMIT,
    userId?: string | null
  ): Promise<RetrievedItem[]> {
    const embedding = await embedText(query, userId);
    const similar = await this.repo.findSimilar({
      contentType: CONTENT_TYPE,
      embedding,
      limit,
    });
    if (similar.length === 0) return [];

    const ids = similar.map((s) => s.content_id);
    const challenges = await prisma.challenge.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true, description: true },
    });
    const byId = new Map(challenges.map((c) => [c.id, c]));

    return similar
      .map((s) => {
        const c = byId.get(s.content_id);
        return c
          ? {
              contentId: c.id,
              title: c.title,
              text: c.description,
              distance: s.distance,
            }
          : null;
      })
      .filter((c): c is RetrievedItem => c !== null);
  }

  /** Grounded answer with citations, or an honest "I don't know". */
  async answerQuestion(
    question: string,
    userId?: string | null
  ): Promise<TutorAnswer> {
    const context = await this.retrieveContext(
      question,
      RETRIEVE_LIMIT,
      userId
    );
    const relevant = context.filter(
      (c) => c.distance <= RELEVANCE_DISTANCE_THRESHOLD
    );

    // Guardrail: nothing relevant → don't call the LLM, don't hallucinate.
    if (relevant.length === 0) {
      return {
        answer:
          "I don't have enough material on the platform to answer that confidently yet. Try rephrasing, or explore the related challenges.",
        confidence: 'low',
        used_context: false,
        citations: [],
      };
    }

    const contextBlock = relevant
      .map((c, i) => `[${i + 1}] ${c.title}\n${c.text}`)
      .join('\n\n');
    const sources = relevant
      .map((c) => `- ${c.title} -> ${c.contentId}`)
      .join('\n');

    const prompt = `You are a coding tutor. Answer the student's question USING ONLY the context below. If the context is insufficient, say so honestly and set used_context=false. Cite the sources you actually used.

Context:
${contextBlock}

Available sources (title -> content_id):
${sources}

Question: ${question}

Return ONLY JSON:
{ "answer": "...", "confidence": "high|medium|low", "used_context": true, "citations": [ { "title": "...", "content_id": "..." } ] }`;

    const cacheKey = `ask:${createHash('sha256').update(question).digest('hex')}`;
    return generateStructured<TutorAnswer>({
      cacheKey,
      cachePrefix: 'tutor',
      prompt,
      schema: TutorAnswerSchema,
      userId,
    });
  }

  /** Progressive hint for a challenge — level-gated, never the full solution. */
  async getHint(
    challengeId: string,
    level: number,
    userId?: string | null
  ): Promise<TutorHint> {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { id: true, title: true, description: true, difficulty: true },
    });
    if (!challenge) throw createAppError('Challenge not found', 404);

    const clamped = Math.min(
      Math.max(1, Math.floor(level) || 1),
      MAX_HINT_LEVEL
    );

    const prompt = `You are a coding tutor giving PROGRESSIVE hints. This is hint level ${clamped} of ${MAX_HINT_LEVEL} (1 = a gentle nudge about how to think about it; ${MAX_HINT_LEVEL} = describe the approach/algorithm at a high level). NEVER reveal the full solution or write the complete code, even at the highest level. Keep it to 1-3 sentences.

Problem: ${challenge.title}
${challenge.description}
Difficulty: ${challenge.difficulty}

Return ONLY JSON: { "hint": "...", "level": ${clamped}, "reveals_full_solution": false }`;

    const cacheKey = `hint:${challengeId}:${clamped}`;
    return generateStructured<TutorHint>({
      cacheKey,
      cachePrefix: 'tutor',
      prompt,
      schema: TutorHintSchema,
      userId,
    });
  }
}
