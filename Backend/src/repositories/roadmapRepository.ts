import { Prisma, PrismaClient } from '@prisma/client';
import { createAppError } from '../middlewares/errorHandler';
import BaseRepository from './baseRepository';
import {
  CommentData,
  ConceptData,
  ResourceStats,
  RoadmapData,
  SubjectData,
  SubjectOrder,
  TopicData,
} from '@/types';
import { invalidateCachePattern } from '@/services/cacheService';
import { Request } from 'express';

const prisma = new PrismaClient();

export default class RoadmapRepository extends BaseRepository<
  PrismaClient['roadmap']
> {
  constructor() {
    super(prisma.roadmap);
  }
  async createRoadmap(data: RoadmapData) {
    try {
      return await prisma.$transaction(async (tx) => {
        const roadmap = await tx.roadmap.create({
          data: {
            title: data.title,
            description: data.description,
            user: { connect: { id: data.author_id } },
            is_public: data.is_public ?? false,
          },
        });

        if (data.concepts) {
          for (const concept of data.concepts) {
            const mainConcept = await tx.mainConcept.create({
              data: {
                name: concept.title,
                description: concept.description,
                order: concept.order,
              },
            });

            await tx.roadmapMainConcept.create({
              data: {
                roadmap_id: roadmap.id,
                main_concept_id: mainConcept.id,
                order: concept.order,
              },
            });

            if (concept.subjects) {
              for (const subjectData of concept.subjects) {
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
          }
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

  async getRoadmap(id: string) {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
        main_concepts: {
          orderBy: { order: 'asc' },
          include: {
            main_concept: {
              include: {
                subjects: {
                  orderBy: { order: 'asc' },
                  include: {
                    subject: {
                      include: {
                        topics: {
                          orderBy: { order: 'asc' },
                          include: {
                            topic: {
                              include: {
                                articles: true,
                                quizzes: true,
                                challenges: true,
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
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!roadmap) {
      throw createAppError('Roadmap not found', 404);
    }

    return roadmap;
  }

  async getUserRoadmap(id: string, user_id: string) {
    const roadmap = await prisma.roadmap.findUnique({
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
    const updated = await prisma.roadmap.update({
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
    return await prisma.$transaction(async (tx) => {
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
    const result = await prisma.$transaction(async (tx) => {
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
    const topic = await prisma.topic.create({
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
    const topic = await prisma.topic.update({
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
    const topic = await prisma.topic.update({
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
    const progress = await prisma.userProgress.upsert({
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
        subject_id: '',
        is_completed: completed,
        completed_at: completed ? new Date() : null,
      },
    });

    return progress;
  }

  async getAllRoadmaps(req: Request, where?: Prisma.RoadmapWhereInput) {
    const { limit = 10, page = 1, search = '' } = req.query;
    const roadmaps = await this.paginate(
      {
        limit: Number(limit),
        page: Number(page),
        search: String(search),
      },
      ['title'],
      {
        include: {
          main_concepts: {
            select: {
              main_concept: {
                include: {
                  subjects: true,
                },
              },
            },
          },
        },
      },
      where
    );

    return roadmaps;
  }

  async deleteRoadmap(id: string): Promise<void> {
    await prisma.roadmap.delete({
      where: { id },
    });
  }

  async updateSubjectsOrder(
    roadmap_id: string,
    subject_orders: SubjectOrder[]
  ): Promise<void> {
    await prisma.$transaction(
      subject_orders.map((order) =>
        prisma.mainConceptSubject.updateMany({
          where: { subject_id: order.subject_id },
          data: { order: order.order },
        })
      )
    );
  }

  async createCustomRoadmap(data: RoadmapData & { sourceRoadmapId?: string }) {
    const roadmap = await prisma.$transaction(async (tx) => {
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
                subject_id: subject.subject?.id || '',
                topic_id: topic.topic?.id || '',
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
      prisma.roadmap.count(),
      prisma.roadmap.count({ where: { is_public: true } }),
      prisma.roadmap.count({ where: { is_public: false } }),
      prisma.contentReport.count({ where: { content_type: 'roadmap' } }),
    ]);

    return { total, active, pending, reported };
  }

  async addComment(data: CommentData) {
    return prisma.comment.create({
      data: {
        content: data.content,
        user_id: data.user_id,
        roadmap_id: data.roadmap_id,
        parent_id: data.parent_id,
      },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                username: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });
  }

  async getRoadmapComments(roadmap_id: string) {
    return prisma.comment.findMany({
      where: {
        roadmap_id,
        parent_id: null,
      },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                username: true,
                avatar_url: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async toggleLike(user_id: string, roadmap_id: string): Promise<void> {
    const existingLike = await prisma.like.findUnique({
      where: {
        user_id_roadmap_id: {
          user_id,
          roadmap_id,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          user_id_roadmap_id: {
            user_id,
            roadmap_id,
          },
        },
      });
    } else {
      await prisma.like.create({
        data: {
          user_id,
          roadmap_id,
        },
      });
    }
  }

  async getRecommendedRoadmaps(user_id: string) {
    const userInterests = await prisma.userRoadmap.findMany({
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
      prisma.like.count({
        where: { roadmap_id },
      }),
      prisma.comment.count({
        where: { roadmap_id },
      }),
      prisma.userRoadmap.count({
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
