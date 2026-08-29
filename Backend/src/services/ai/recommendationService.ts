/**
 * Adaptive challenge recommendations (Spine B2). "What should I try next?" —
 * driven by the learner's own recent activity rather than a static list.
 *
 * Approach: take the learner's most recent attempted challenge as the semantic
 * SEED, find the nearest challenges by embedding (pgvector cosine), exclude
 * everything they've already attempted, and return the details in similarity
 * order. Returns [] (not an error) when there's no signal yet.
 */

import prisma from '../../lib/prisma.js';
import { ContentEmbeddingRepository } from '../../repositories/contentEmbeddingRepository.js';

export interface RecommendedChallenge {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  distance: number;
}

const CONTENT_TYPE = 'challenge';
const RECENT_SUBMISSION_WINDOW = 50;

export class RecommendationService {
  private readonly repo: ContentEmbeddingRepository;

  constructor(
    repo: ContentEmbeddingRepository = new ContentEmbeddingRepository()
  ) {
    this.repo = repo;
  }

  async recommendChallenges(
    userId: string,
    limit = 5
  ): Promise<RecommendedChallenge[]> {
    const submissions = await prisma.challengeSubmission.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: RECENT_SUBMISSION_WINDOW,
      select: { challenge_id: true },
    });
    if (submissions.length === 0) return [];

    const attempted = Array.from(
      new Set(submissions.map((s) => s.challenge_id))
    );
    const seedChallengeId = attempted[0]; // most recent

    // Pull a few extra so we still hit `limit` after excluding attempted ones.
    const similar = await this.repo.findSimilarToContent({
      contentType: CONTENT_TYPE,
      contentId: seedChallengeId,
      limit: limit + attempted.length,
      excludeContentIds: attempted,
    });
    if (similar.length === 0) return [];

    const orderedIds = similar.slice(0, limit).map((s) => s.content_id);
    const challenges = await prisma.challenge.findMany({
      where: { id: { in: orderedIds }, status: 'ACTIVE' },
      select: { id: true, title: true, difficulty: true, category: true },
    });
    const byId = new Map(challenges.map((c) => [c.id, c]));

    // Preserve the similarity ordering + attach the distance.
    return similar
      .map((s) => {
        const c = byId.get(s.content_id);
        return c ? { ...c, distance: s.distance } : null;
      })
      .filter((c): c is RecommendedChallenge => c !== null)
      .slice(0, limit);
  }
}
