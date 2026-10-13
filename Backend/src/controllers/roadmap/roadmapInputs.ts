import { Prisma } from '@prisma/client';
import { Difficulty } from '../../constants/enums';

/** The `type` tab on the roadmap listing, translated to a filter. */
export function buildRoadmapListWhere(
  type: unknown,
  userId?: string
): Prisma.RoadmapWhereInput {
  const whereClause: Prisma.RoadmapWhereInput = { is_public: true };

  switch (type) {
    case 'featured':
    case 'recommended':
      return { ...whereClause, popularity: { gt: 100 } };
    case 'my-roadmaps':
      return userId ? { ...whereClause, user_id: userId } : whereClause;
    case 'enrolled':
      return userId
        ? { ...whereClause, user_roadmaps: { some: { user_id: userId } } }
        : whereClause;
    case 'trending': // sorted by the repository; every public roadmap applies
    default:
      return whereClause;
  }
}

// Map frontend difficulty values to Prisma enum
const difficultyMap: Record<string, Difficulty> = {
  BEGINNER: 'EASY',
  INTERMEDIATE: 'MEDIUM',
  ADVANCED: 'HARD',
};

interface ConceptInput {
  main_concept_id: string;
  subjects: { topics: { topic_id: string }[] }[];
}

/** Builds the nested create for `POST /roadmaps` from the request body. */
export function buildRoadmapCreateInput(
  body: Record<string, unknown>,
  userId: string
): Prisma.RoadmapCreateInput {
  const {
    title,
    description,
    categoryId,
    difficulty,
    estimatedHours,
    isPublic,
    version,
    tags = [],
    mainConcepts = [],
  } = body as {
    title: string;
    description: string;
    categoryId?: string;
    difficulty?: string;
    estimatedHours?: number;
    isPublic?: boolean;
    version?: string;
    tags?: unknown;
    mainConcepts?: ConceptInput[];
  };

  const prismaDifficulty = (difficultyMap[
    difficulty?.toUpperCase() as string
  ] || difficulty) as Difficulty;

  return {
    title,
    description,
    category: categoryId ? { connect: { id: categoryId } } : undefined,
    difficulty: prismaDifficulty,
    estimatedHours,
    is_public: isPublic,
    version,
    tags: Array.isArray(tags) ? tags.join(',') : '',
    user: { connect: { id: userId } },
    main_concepts: {
      create: mainConcepts.map((concept, index) => ({
        order: index,
        main_concept: { connect: { id: concept.main_concept_id } },
      })),
    },
    topics: {
      create: mainConcepts.flatMap((concept, conceptIndex) =>
        concept.subjects.flatMap((subject, subjectIndex) =>
          subject.topics.map((topic, topicIndex) => ({
            topic: { connect: { id: topic.topic_id } },
            order: conceptIndex * 1000 + subjectIndex * 100 + topicIndex,
          }))
        )
      ),
    },
  };
}
