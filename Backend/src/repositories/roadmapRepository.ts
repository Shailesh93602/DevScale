import { Prisma } from '@prisma/client';
import { createAppError } from '../middlewares/errorHandler.js';
import { getCache, setCache, invalidateCachePattern } from '../services/cacheService.js';
import BaseRepository from './baseRepository.js';
import prisma from '../lib/prisma.js';
import { isUuid } from '../utils/slugify.js';
import {
  CommentData,
  ConceptData,
  ResourceStats,
  RoadmapData,
  SubjectData,
  SubjectOrder,
  TopicData,
} from '../types/index.js';

import { Request } from 'express';

interface RoadmapListItem {
  id: string;
  _count: {
    likes: number;
    comments: number;
    user_roadmaps: number;
    topics: number;
  };
  likes?: Array<{ id: string }>;
  user_roadmaps?: Array<{ id: string }>;
  topics?: Array<{ topic: { id: string; title: string } }>;
  estimatedHours?: number | null;
  popularity?: number;
}

export default class RoadmapRepository extends BaseRepository< Roadmap, typeof prisma.roadmap > {
  constructor() {
    super(prisma.roadmap);
  }

  async createRoadmap(data: RoadmapData) {
    try {
      return await this.prismaClient.$transaction(async (tx) => {
        const roadmap = await tx.roadmap.create({
          data: {
            title: data.title,
            description: data.description,
            user: { connect: { id: data.author_id } },
            is_public: data.is_public ?? false,
          },
        });

        if (data.concepts) {
          await this.createConcepts(tx, roadmap.id, data.concepts);
        }

        return roadmap;
      });
    } catch (error) {
      throw createAppError(
        'Failed to create roadmap',
        500,
        error as Record<string, unknown>
      );
    }
  }

  private async createConcepts(tx: Prisma.TransactionClient, roadmapId: string, concepts: ConceptData[]) {
    for (const concept of concepts) {
      const mainConcept = await tx.mainConcept.create({
        data: {
          name: concept.title,
          description: concept.description,
          order: concept.order,
        },
      });

      await tx.roadmapMainConcept.create({
        data: {
          roadmap_id: roadmapId,
          main_concept_id: mainConcept.id,
          order: concept.order,
        },
      });

      if (concept.subjects) {
        await this.createSubjects(tx, mainConcept.id, concept.subjects);
      }
    }
  }

  private async createSubjects(tx: Prisma.TransactionClient, mainConceptId: string, subjects: SubjectData[]) {
    for (const subjectData of subjects) {
      const subject = await tx.subject.create({
        data: {
          title: subjectData.title,
          description: subjectData.description,
          order: subjectData.order,
        },
      });

      await tx.mainConceptSubject.create({
        data: {
          main_concept_id: mainConceptId,
          subject_id: subject.id,
          order: subjectData.order,
        },
      });

      if (subjectData.topics) {
        await this.createTopics(tx, subject.id, subjectData.topics);
      }
    }
  }

  private async createTopics(tx: Prisma.TransactionClient, subjectId: string, topics: TopicData[]) {
    for (const topicData of topics) {
      const topic = await tx.topic.create({
        data: {
          title: topicData.title,
          description: topicData.description,
          order: topicData.order,
          content: topicData.content,
          resources: topicData.resources,
          prerequisites: topicData.prerequisites,
        },
      });

      await tx.subjectTopic.create({
        data: {
          subject_id: subjectId,
          topic_id: topic.id,
          order: topicData.order,
        },
      });
    }
  }

  /** Resolves a slug or UUID to a canonical UUID. Throws 404 if not found. */
  private async resolveRoadmapId(idOrSlug: string): Promise<string> {
    if (isUuid(idOrSlug)) return idOrSlug;
    const row = await this.prismaClient.roadmap.findUnique({
      where: { slug: idOrSlug },
      select: { id: true },
    });
    if (!row) throw createAppError('Roadmap not found', 404);
    return row.id;
  }

  async getRoadmap(idOrSlug: string, userId?: string) {
    const id = await this.resolveRoadmapId(idOrSlug);
    const cacheKey = `roadmap:detail:${id}:${userId || 'anon'}`;
    const cached = await getCache<unknown>(cacheKey);
    if (cached) return cached;

    // 1. Fetch flat roadmap info + counts (+ likes/bookmarks if logged in)
    const roadmapPromise = this.prismaClient.roadmap.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, first_name: true, last_name: true, avatar_url: true } },
        category: { select: { id: true, name: true } },
        _count: {
          select: {
            likes: true,
            comments: { where: { parent_id: null } },
            user_roadmaps: true,
            topics: true,
          },
        },
        likes: userId ? { where: { user_id: userId }, select: { id: true } } : false,
        user_roadmaps: userId ? { where: { user_id: userId }, select: { id: true } } : false,
      },
    });

    // 2. Fetch the entire nested concept tree using a single raw SQL query with JSON aggregation.
    // This offloads the heavy JOINs and array grouping to Postgres (written in C) instead of
    // transferring thousands of flattened rows to Node.js for Prisma to group.
    const conceptsPromise = this.prismaClient.$queryRaw<{ main_concepts: unknown }[]>`
      SELECT 
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'main_concept', jsonb_build_object(
                'id', mc.id,
                'name', mc.name,
                'description', mc.description,
                'order', mc."order",
                'subjects', (
                  SELECT COALESCE(
                    jsonb_agg(
                      jsonb_build_object(
                        'id', rs.id,
                        'order', rs."order",
                        'subject', jsonb_build_object(
                          'id', s.id,
                          'title', s.title,
                          'description', s.description,
                          'order', s."order",
                          'topics', (
                            SELECT COALESCE(
                              jsonb_agg(
                                jsonb_build_object(
                                  'id', rt.id,
                                  'order', rt."order",
                                  'topic', jsonb_build_object(
                                    'id', t.id,
                                    'title', t.title,
                                    'description', t.description,
                                    'order', t."order",
                                    '_count', jsonb_build_object(
                                      'articles', (SELECT count(*) FROM "Article" WHERE "Article".topic_id = t.id),
                                      'quizzes', (SELECT count(*) FROM "Quiz" WHERE "Quiz".topic_id = t.id),
                                      'challenges', (SELECT count(*) FROM "Challenge" WHERE "Challenge".topic_id = t.id)
                                    )
                                  )
                                ) ORDER BY rt."order" ASC
                              ), '[]'::jsonb)
                            FROM "SubjectTopic" rt
                            JOIN "Topic" t ON t.id = rt.topic_id
                            WHERE rt.subject_id = s.id
                          )
                        )
                      ) ORDER BY rs."order" ASC
                    ), '[]'::jsonb) FROM "MainConceptSubject" rs
                  JOIN "Subject" s ON s.id = rs.subject_id
                  WHERE rs.main_concept_id = mc.id
                )
              )
            ) ORDER BY rmc."order" ASC
          ), '[]'::jsonb) AS main_concepts
      FROM "RoadmapMainConcept" rmc
      JOIN "MainConcept" mc ON mc.id = rmc.main_concept_id
      WHERE rmc.roadmap_id = ${id}
    `;

    // 3. Optional: fetch user progress if logged in
    const progressPromise = userId
      ? this.prismaClient.userProgress.findMany({
        where: {
          user_id: userId,
          topic: {
            roadmaps: { some: { roadmap_id: id } }
          }
        },
        select: { is_completed: true },
      })
      : Promise.resolve([]);

    // Execute all queries in parallel
    const [roadmap, conceptsResult, userProgress] = await Promise.all([
      roadmapPromise,
      conceptsPromise,
      progressPromise
    ]);

    if (!roadmap) {
      throw createAppError('Roadmap not found', 404);
    }

    // Process progress
    let progress = 0;
    if (userId && roadmap.user_roadmaps && roadmap.user_roadmaps.length > 0) {
      const completedTopics = userProgress.filter((p) => p.is_completed).length;
      progress = roadmap._count.topics > 0
        ? Math.round((completedTopics / roadmap._count.topics) * 100)
        : 0;
    }

    const main_concepts = conceptsResult[0]?.main_concepts || [];

    const result = {
      ...roadmap,
      main_concepts,
      likesCount: roadmap._count.likes,
      commentsCount: roadmap._count.comments,
      bookmarksCount: roadmap._count.user_roadmaps,
      isLiked: Boolean(roadmap.likes?.length),
      isBookmarked: Boolean(roadmap.user_roadmaps?.length),
      steps: roadmap._count.topics,
      isEnrolled: Boolean(roadmap.user_roadmaps?.length),
      progress: progress,
      estimatedTime: roadmap.estimatedHours ? `${roadmap.estimatedHours} hours` : undefined,
      isFeatured: roadmap.popularity > 100,
    };

    await setCache(cacheKey, result, { ttl: 86400 }); // 24h — roadmap metadata rarely changes
    return result;
  }

  async getUserRoadmap(id: string, user_id: string) {
    const roadmap = await this.prismaClient.roadmap.findUnique({
      where: { id },
      include: {
        user_roadmaps: {
          where: {
            user_id,
          },
        },
      },
    });

    if (!roadmap) {
      throw createAppError('Roadmap not found', 404);
    }

    return roadmap;
  }

  async updateRoadmap(id: string, data: Partial<RoadmapData>) {
    const updated = await this.prismaClient.roadmap.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        is_public: data.is_public,
      },
      include: {
        main_concepts: {
          select: {
            main_concept: {
              include: {
                subjects: {
                  select: {
                    subject: {
                      include: {
                        topics: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return updated;
  }

  async addConcept(roadmap_id: string, data: ConceptData) {
    return await this.prismaClient.$transaction(async (tx) => {
      const mainConcept = await tx.mainConcept.create({
        data: {
          name: data.title,
          description: data.description,
          order: data.order,
        },
      });

      await tx.roadmapMainConcept.create({
        data: {
          roadmap_id,
          main_concept_id: mainConcept.id,
          order: data.order,
        },
      });

      if (data.subjects) {
        for (const subjectData of data.subjects) {
          const subject = await tx.subject.create({
            data: {
              title: subjectData.title,
              description: subjectData.description,
              order: subjectData.order,
            },
          });

          await tx.mainConceptSubject.create({
            data: {
              main_concept_id: mainConcept.id,
              subject_id: subject.id,
              order: subjectData.order,
            },
          });

          if (subjectData.topics) {
            for (const topicData of subjectData.topics) {
              const topic = await tx.topic.create({
                data: {
                  title: topicData.title,
                  description: topicData.description,
                  order: topicData.order,
                  content: topicData.content,
                  resources: topicData.resources,
                  prerequisites: topicData.prerequisites,
                },
              });

              await tx.subjectTopic.create({
                data: {
                  subject_id: subject.id,
                  topic_id: topic.id,
                  order: topicData.order,
                },
              });
            }
          }
        }
      }

      return mainConcept;
    });
  }

  async addSubject(main_concept_id: string, data: SubjectData) {
    const result = await this.prismaClient.$transaction(async (tx) => {
      const subject = await tx.subject.create({
        data: {
          title: data.title,
          description: data.description,
          order: data.order,
          main_concepts: { connect: { id: main_concept_id } },
        },
      });

      if (data.topics) {
        for (const topicData of data.topics) {
          const topic = await tx.topic.create({
            data: {
              title: topicData.title,
              description: topicData.description,
              order: topicData.order,
              content: topicData.content,
              resources: topicData.resources,
              prerequisites: topicData.prerequisites,
            },
          });

          await tx.subjectTopic.create({
            data: {
              subject_id: subject.id,
              topic_id: topic.id,
              order: topicData.order,
            },
          });
        }
      }

      return subject;
    });

    return result;
  }

  async addTopic(subject_id: string, data: TopicData) {
    const topic = await this.prismaClient.topic.create({
      data: {
        title: data.title,
        description: data.description,
        order: data.order,
        content: data.content,
        resources: data.resources,
        prerequisites: data.prerequisites,
        subjects: {
          create: {
            subject_id: subject_id,
            order: data.order,
          },
        },
      },
    });

    return topic;
  }

  async updateTopicContent(
    topicId: string,
    content: string,
    resources?: string[]
  ) {
    const topic = await this.prismaClient.topic.update({
      where: { id: topicId },
      data: {
        content,
        resources,
      },
    });

    return topic;
  }

  async linkContent(
    topicId: string,
    data: {
      articleIds?: string[];
      quizIds?: string[];
      challengeIds?: string[];
    }
  ) {
    const topic = await this.prismaClient.topic.update({
      where: { id: topicId },
      data: {
        articles: {
          connect: data.articleIds?.map((id) => ({ id })),
        },
        quizzes: {
          connect: data.quizIds?.map((id) => ({ id })),
        },
        challenges: {
          connect: data.challengeIds?.map((id) => ({ id })),
        },
      },
      include: {
        articles: true,
        quizzes: true,
        challenges: true,
      },
    });

    return topic;
  }

  async trackProgress(userId: string, topicId: string, completed: boolean) {
    const progress = await this.prismaClient.userProgress.upsert({
      where: {
        user_id_topic_id: {
          user_id: userId,
          topic_id: topicId,
        },
      },
      update: {
        is_completed: completed,
        completed_at: completed ? new Date() : null,
      },
      create: {
        user_id: userId,
        topic_id: topicId,
        is_completed: completed,
        completed_at: completed ? new Date() : null,
      },
    });

    return progress;
  }

  async getAllRoadmaps(req: Request, where?: Prisma.RoadmapWhereInput) {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const difficulty = typeof req.query.difficulty === 'string' ? req.query.difficulty : '';
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'popular';
    const userId = req.user?.id;

    // ─── Cache Key ───
    const cacheKey = `roadmaps:list:${userId || 'guest'}:${sort}:${page}:${limit}:${search}:${category || ''}:${difficulty || ''}:${JSON.stringify(where || {})}`;
    const cached = await getCache<{ data: unknown[]; meta: Record<string, unknown> }>(cacheKey);
    if (cached) return cached;

    const whereClause: Prisma.RoadmapWhereInput = {
      ...where,
      ...(category ? { category_id: { in: category.split(',') } } : {}),
      ...(difficulty ? { difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD' } : {}),
    };

    const combinedWhere: Prisma.RoadmapWhereInput = { ...where, ...whereClause };
    const sortOptions = this.getRoadmapSortOptions(sort);

    const topicsInclude = userId ? { topics: { select: { topic: { select: { id: true, title: true } } } } } : {};

    const roadmaps = (await this.paginate(
      { limit, page, search, sort: sortOptions },
      ['title'],
      {
        include: {
          user: { select: { id: true, username: true, first_name: true, last_name: true, avatar_url: true } },
          category: { select: { id: true, name: true } },
          ...topicsInclude,
          _count: {
            select: {
              likes: true,
              comments: { where: { parent_id: null } },
              user_roadmaps: true,
              topics: true,
            },
          },
          likes: userId ? { where: { user_id: userId }, select: { id: true } } : false,
          user_roadmaps: userId ? { where: { user_id: userId }, select: { id: true } } : false,
        },
      },
      combinedWhere
    )) as unknown as { data: RoadmapListItem[]; meta: Record<string, unknown> };

    const userProgressMap = await this.calculateUserProgress(userId, roadmaps.data);

    const result = {
      ...roadmaps,
      data: roadmaps.data.map((roadmap: RoadmapListItem) =>
        this.formatRoadmapResponse(roadmap, userProgressMap[roadmap.id] || 0)
      ),
    };

    await setCache(cacheKey, result, { ttl: userId ? 300 : 86400 });
    return result;
  }

  private getRoadmapSortOptions(sort: string) {
    switch (sort) {
      case 'recent': return { field: 'created_at', direction: 'desc' as const };
      case 'popular':
      case 'rating':
      default: return { field: 'popularity', direction: 'desc' as const };
    }
  }

  private async calculateUserProgress(userId: string | undefined, roadmapsData: RoadmapListItem[]) {
    const userProgressMap: Record<string, number> = {};
    if (!userId || roadmapsData.length === 0) return userProgressMap;

    const roadmapTopicIds = roadmapsData.flatMap((roadmap) =>
      (roadmap.topics || []).map((t: { topic: { id: string } }) => t.topic.id)
    );

    if (roadmapTopicIds.length === 0) return userProgressMap;

    const userProgress = await this.prismaClient.userProgress.findMany({
      where: {
        user_id: userId,
        topic_id: { in: roadmapTopicIds },
        is_completed: true,
      },
      select: { topic_id: true },
    });

    const completedTopicIds = new Set(userProgress.map((p) => p.topic_id).filter(Boolean) as string[]);

    roadmapsData.forEach((roadmap) => {
      if (roadmap.id && roadmap.topics) {
        const roadmapTopics = roadmap.topics.map((t: { topic: { id: string } }) => t.topic.id);
        const completedCount = roadmapTopics.filter((topicId: string) => completedTopicIds.has(topicId)).length;
        userProgressMap[roadmap.id] = roadmapTopics.length > 0
          ? Math.round((completedCount / roadmapTopics.length) * 100)
          : 0;
      }
    });

    return userProgressMap;
  }

  private formatRoadmapResponse(roadmap: RoadmapListItem, progress: number) {
    return {
      ...roadmap,
      topics: undefined, // Remove heavy topics array from serialized response
      likesCount: roadmap._count.likes,
      commentsCount: roadmap._count.comments,
      bookmarksCount: roadmap._count.user_roadmaps,
      isLiked: Boolean(roadmap.likes?.length),
      isBookmarked: Boolean(roadmap.user_roadmaps?.length),
      steps: roadmap._count.topics,
      isEnrolled: Boolean(roadmap.user_roadmaps?.length),
      progress,
      estimatedTime: roadmap.estimatedHours ? `${roadmap.estimatedHours} hours` : undefined,
      isFeatured: (roadmap.popularity ?? 0) > 100,
    };
  }

  async deleteRoadmap(id: string): Promise<void> {
    await this.prismaClient.roadmap.delete({
      where: { id },
    });
  }

  async updateSubjectsOrder(
    roadmap_id: string,
    subject_orders: SubjectOrder[]
  ): Promise<void> {
    await this.prismaClient.$transaction(
      subject_orders.map((order) =>
        this.prismaClient.mainConceptSubject.updateMany({
          where: { subject_id: order.subject_id },
          data: { order: order.order },
        })
      )
    );
  }

  async createCustomRoadmap(data: RoadmapData & { sourceRoadmapId?: string }) {
    const roadmap = await this.prismaClient.$transaction(async (tx) => {
      const newRoadmap = await tx.roadmap.create({
        data: {
          title: data.title,
          description: data.description,
          user: { connect: { id: data.author_id } },
          is_public: data.is_public ?? false,
        },
      });

      if (data.sourceRoadmapId) {
        const sourceRoadmap = await tx.roadmap.findUnique({
          where: { id: data.sourceRoadmapId },
          include: {
            main_concepts: {
              select: {
                main_concept: {
                  include: {
                    subjects: {
                      select: {
                        order: true,
                        subject: {
                          include: {
                            topics: {
                              select: {
                                topic: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!sourceRoadmap) {
          throw createAppError('Source roadmap not found', 404);
        }

        for (const main_concept of sourceRoadmap.main_concepts) {
          await tx.mainConcept.create({
            data: {
              name: main_concept.main_concept?.name,
              description: main_concept.main_concept?.description,
              order: main_concept.main_concept?.order,
            },
          });
          for (const subject of main_concept.main_concept?.subjects ?? []) {
            await tx.subject.create({
              data: {
                title: subject.subject?.title,
                description: subject.subject?.description,
                order: subject.subject?.order,
                main_concepts: {
                  create: {
                    main_concept_id: main_concept.main_concept?.id,
                    order: subject.order,
                  },
                },
              },
            });
            if (subject.subject?.topics) {
              const subjectTopics = subject.subject?.topics?.map((topic) => ({
                subject_id: subject.subject?.id,
                topic_id: topic.topic?.id,
                order: topic.topic?.order || 0,
              }));
              await tx.subjectTopic.createMany({
                data: subjectTopics,
              });
            }
          }
        }
      }

      return newRoadmap;
    });

    return roadmap;
  }

  async manageRoadmap(roadmap_id: string, action: string) {
    const roadmap = await this.findUnique({
      where: { id: roadmap_id },
      include: { topics: true },
    });

    if (!roadmap) throw createAppError('Roadmap not found', 404);

    switch (action) {
      case 'publish':
        await this.update({
          where: { id: roadmap_id },
          data: { is_public: true },
        });
        break;
      case 'unpublish':
        await this.update({
          where: { id: roadmap_id },
          data: { is_public: false },
        });
        break;
      case 'delete':
        await this.delete({ where: { id: roadmap_id } });
        break;
      default:
        throw createAppError('Invalid action', 400);
    }

    await invalidateCachePattern(`roadmap:${roadmap_id}:*`);
  }

  async getRoadmapStats(): Promise<ResourceStats> {
    const [total, active, pending, reported] = await Promise.all([
      this.prismaClient.roadmap.count(),
      this.prismaClient.roadmap.count({ where: { is_public: true } }),
      this.prismaClient.roadmap.count({ where: { is_public: false } }),
      this.prismaClient.contentReport.count({
        where: { content_type: 'roadmap' },
      }),
    ]);

    return { total, active, pending, reported };
  }

  async addComment(data: CommentData) {
    return this.prismaClient.comment.create({
      data: {
        content: data.content,
        user_id: data.user_id,
        roadmap_id: data.roadmap_id,
        parent_id: data.parent_id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
                avatar_url: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });
  }

  async getRoadmapComments(roadmap_id: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [total, comments] = await Promise.all([
      this.prismaClient.comment.count({
        where: {
          roadmap_id,
          parent_id: null,
        },
      }),
      this.prismaClient.comment.findMany({
        where: {
          roadmap_id,
          parent_id: null,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              avatar_url: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  first_name: true,
                  last_name: true,
                  avatar_url: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: comments,
      meta: {
        total,
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async toggleLike(user_id: string, roadmap_id: string): Promise<void> {
    const existingLike = await this.prismaClient.like.findUnique({
      where: {
        user_id_roadmap_id: {
          user_id,
          roadmap_id,
        },
      },
    });

    if (existingLike) {
      await this.prismaClient.like.delete({
        where: {
          user_id_roadmap_id: {
            user_id,
            roadmap_id,
          },
        },
      });
    } else {
      await this.prismaClient.like.create({
        data: {
          user_id,
          roadmap_id,
        },
      });
    }
  }

  async getRecommendedRoadmaps(user_id: string) {
    const userInterests = await this.prismaClient.userRoadmap.findMany({
      where: { user_id },
      include: {
        roadmap: {
          include: {
            main_concepts: {
              include: {
                main_concept: {
                  include: {
                    subjects: {
                      include: {
                        subject: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const interests = new Set<string>();
    userInterests.forEach((ur) => {
      ur.roadmap.main_concepts.forEach((concept) => {
        concept.main_concept.subjects.forEach((subject) => {
          interests.add(subject.subject.title.toLowerCase());
        });
      });
    });

    return this.findMany({
      where: {
        is_public: true,
        NOT: {
          id: {
            in: userInterests.map((ur) => ur.roadmap_id),
          },
        },
        main_concepts: {
          some: {
            main_concept: {
              subjects: {
                some: {
                  subject: {
                    title: {
                      in: Array.from(interests),
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
          },
        },
      },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        likes: {
          _count: 'desc',
        },
      },
      take: 10,
    });
  }

  async getEngagementMetrics(roadmap_id: string) {
    const [likes, comments, saves] = await Promise.all([
      this.prismaClient.like.count({
        where: { roadmap_id },
      }),
      this.prismaClient.comment.count({
        where: { roadmap_id },
      }),
      this.prismaClient.userRoadmap.count({
        where: { roadmap_id },
      }),
    ]);

    return {
      likes,
      comments,
      saves,
      engagementScore: likes * 2 + comments * 3 + saves * 5,
    };
  }

  async shareRoadmap(roadmapId: string, platform: string) {
    const baseUrl = process.env.FRONTEND_URL;
    const roadmapUrl = `${baseUrl}/roadmaps/${roadmapId}`;

    const sharingUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(roadmapUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(roadmapUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(roadmapUrl)}`,
    };

    return sharingUrls[platform as keyof typeof sharingUrls] || roadmapUrl;
  }
}
