import { createAppError } from '../middlewares/errorHandler';
import { getCache, setCache, deleteCache } from './cacheService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RoadmapData {
  title: string;
  description: string;
  authorId: string;
  isPublic?: boolean;
  concepts?: ConceptData[];
}

interface ConceptData {
  title: string;
  description: string;
  order: number;
  subjects?: SubjectData[];
}

interface SubjectData {
  title: string;
  description: string;
  order: number;
  topics?: TopicData[];
}

interface TopicData {
  title: string;
  description: string;
  order: number;
  content?: string;
  resources?: string[];
  prerequisites?: string[];
}

interface SubjectOrder {
  subjectId: string;
  order: number;
}

interface UserRoadmapData {
  userId: string;
  roadmapId: string;
  topicId: string;
  isCustom?: boolean;
  title?: string;
  description?: string;
}

export class RoadmapService {
  static async createRoadmap(data: RoadmapData) {
    try {
      const roadmap = await prisma.roadmap.create({
        data: {
          title: data.title,
          description: data.description,
          user: { connect: { id: data.authorId } },
          isPublic: data.isPublic ?? false,
          concepts: {
            create: data.concepts?.map((concept) => ({
              title: concept.title,
              description: concept.description,
              order: concept.order,
              subjects: {
                create: concept.subjects?.map((subject) => ({
                  title: subject.title,
                  description: subject.description,
                  order: subject.order,
                  topics: {
                    create: subject.topics?.map((topic) => ({
                      title: topic.title,
                      description: topic.description,
                      order: topic.order,
                      content: topic.content,
                      resources: topic.resources,
                      prerequisites: topic.prerequisites,
                    })),
                  },
                })),
              },
            })),
          },
        },
        include: {
          user: {
            select: {
              username: true,
              avatar_url: true,
            },
          },
          concepts: {
            include: {
              subjects: {
                include: {
                  topics: true,
                },
              },
            },
          },
        },
      });

      await deleteCache('roadmaps:all');
      return roadmap;
    } catch (error) {
      throw createAppError(
        'Failed to create roadmap',
        500,
        error as Record<string, unknown>
      );
    }
  }

  static async getRoadmap(id: string) {
    const cached = await getCache(`roadmap:${id}`);
    if (cached) return cached;

    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
        concepts: {
          orderBy: { order: 'asc' },
          include: {
            subjects: {
              orderBy: { order: 'asc' },
              include: {
                topics: {
                  orderBy: { order: 'asc' },
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

    await setCache(`roadmap:${id}`, roadmap, { ttl: 3600 });
    return roadmap;
  }

  static async updateRoadmap(id: string, data: Partial<RoadmapData>) {
    const updated = await prisma.roadmap.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        isPublic: data.isPublic,
      },
      include: {
        concepts: {
          include: {
            subjects: {
              include: {
                topics: true,
              },
            },
          },
        },
      },
    });

    await deleteCache(`roadmap:${id}`);
    await deleteCache('roadmaps:all');
    return updated;
  }

  static async addConcept(roadmapId: string, data: ConceptData) {
    const concept = await prisma.concept.create({
      data: {
        title: data.title,
        description: data.description,
        order: data.order,
        roadmap: { connect: { id: roadmapId } },
        subjects: data.subjects
          ? {
              create: data.subjects.map((subject) => ({
                title: subject.title,
                description: subject.description,
                order: subject.order,
                topics: subject.topics
                  ? {
                      create: subject.topics,
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        subjects: {
          include: {
            topics: true,
          },
        },
      },
    });

    await deleteCache('roadmaps:all');
    return concept;
  }

  static async addSubject(conceptId: string, data: SubjectData) {
    const subject = await prisma.subject.create({
      data: {
        title: data.title,
        description: data.description,
        order: data.order,
        concept: { connect: { id: conceptId } },
        topics: data.topics
          ? {
              create: data.topics.map((topic) => ({
                title: topic.title,
                description: topic.description,
                order: topic.order,
                content: topic.content,
                resources: topic.resources,
                prerequisites: topic.prerequisites,
              })),
            }
          : undefined,
      },
      include: {
        topics: true,
      },
    });

    await deleteCache('roadmaps:all');
    return subject;
  }

  static async addTopic(subjectId: string, data: TopicData) {
    const topic = await prisma.topic.create({
      data: {
        ...data,
        subjectId,
      },
    });

    await deleteCache('roadmaps:all');
    return topic;
  }

  static async updateTopicContent(
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

    await deleteCache('roadmaps:all');
    return topic;
  }

  static async linkContent(
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

    await deleteCache('roadmaps:all');
    return topic;
  }

  static async trackProgress(
    userId: string,
    topicId: string,
    completed: boolean
  ) {
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      update: {
        isCompleted: completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId,
        topicId,
        subjectId: '',
        isCompleted: completed,
        completedAt: completed ? new Date() : null,
      },
    });

    await deleteCache('roadmaps:all');
    return progress;
  }

  static async getAllRoadmaps(userId?: string) {
    const roadmaps = await prisma.roadmap.findMany({
      include: {
        mainConcepts: {
          include: {
            subjects: true,
          },
        },
        userRoadmaps: {
          where: userId ? { userId } : undefined,
        },
      },
    });

    return roadmaps;
  }

  static async deleteRoadmap(id: string): Promise<void> {
    await prisma.roadmap.delete({
      where: { id },
    });
    await deleteCache(`roadmap:${id}`);
    await deleteCache('roadmaps:all');
  }

  static async updateSubjectsOrder(
    roadmapId: string,
    subjectOrders: SubjectOrder[]
  ): Promise<void> {
    await prisma.$transaction(
      subjectOrders.map((order) =>
        prisma.subject.update({
          where: { id: order.subjectId },
          data: { order: order.order },
        })
      )
    );
    await deleteCache('roadmaps:all');
  }

  static async createCustomRoadmap(
    data: RoadmapData & { sourceRoadmapId?: string }
  ) {
    const roadmap = await prisma.$transaction(async (tx) => {
      // Create new roadmap
      const newRoadmap = await tx.roadmap.create({
        data: {
          title: data.title,
          description: data.description,
          user: { connect: { id: data.authorId } },
          isPublic: data.isPublic ?? false,
        },
      });

      // If cloning from existing roadmap
      if (data.sourceRoadmapId) {
        const sourceRoadmap = await tx.roadmap.findUnique({
          where: { id: data.sourceRoadmapId },
          include: {
            concepts: {
              include: {
                subjects: {
                  include: {
                    topics: true,
                  },
                },
              },
            },
          },
        });

        if (!sourceRoadmap) {
          throw createAppError('Source roadmap not found', 404);
        }

        // Clone concepts, subjects, and topics
        for (const concept of sourceRoadmap.concepts) {
          const newConcept = await tx.concept.create({
            data: {
              title: concept.title,
              description: concept.description,
              order: concept.order,
              roadmapId: newRoadmap.id,
            },
          });

          for (const subject of concept.subjects) {
            const newSubject = await tx.subject.create({
              data: {
                title: subject.title,
                description: subject.description,
                order: subject.order,
                conceptId: newConcept.id,
              },
            });

            await tx.topic.createMany({
              data: subject.topics.map((topic) => ({
                title: topic.title,
                description: topic.description,
                order: topic.order,
                content: topic.content,
                resources: topic.resources,
                prerequisites: topic.prerequisites,
                subjectId: newSubject.id,
              })),
            });
          }
        }
      }

      await deleteCache('roadmaps:all');
      return newRoadmap;
    });

    return this.getRoadmap(roadmap.id);
  }

  static async saveRoadmap(data: UserRoadmapData) {
    const userRoadmap = await prisma.userRoadmap.create({
      data: {
        user: { connect: { id: data.userId } },
        roadmap: { connect: { id: data.roadmapId } },
        isCustom: data.isCustom ?? false,
        topic: { connect: { id: data.topicId } },
      },
      include: {
        roadmap: {
          include: {
            concepts: {
              include: {
                subjects: {
                  include: {
                    topics: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    await deleteCache('roadmaps:all');
    return userRoadmap;
  }

  static async getUserRoadmaps(userId: string) {
    const userRoadmaps = await prisma.userRoadmap.findMany({
      where: { userId },
      include: {
        roadmap: {
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
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return userRoadmaps;
  }

  static async updateRoadmapPrivacy(id: string, isPublic: boolean) {
    const roadmap = await prisma.roadmap.update({
      where: { id },
      data: { isPublic },
    });

    await deleteCache('roadmaps:all');
    return roadmap;
  }

  static async getPublicRoadmaps(filters?: {
    search?: string;
    authorId?: string;
    sort?: 'popular' | 'recent';
  }) {
    const roadmaps = await prisma.roadmap.findMany({
      where: {
        isPublic: true,
        userId: filters?.authorId,
        OR: filters?.search
          ? [
              { title: { contains: filters.search, mode: 'insensitive' } },
              {
                description: { contains: filters.search, mode: 'insensitive' },
              },
            ]
          : undefined,
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
            concepts: true,
          },
        },
      },
      orderBy:
        filters?.sort === 'popular'
          ? { likes: { _count: 'desc' } }
          : { createdAt: 'desc' },
    });

    return roadmaps;
  }

  static async getRoadmapProgress(userId: string, roadmapId: string) {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        concepts: {
          include: {
            subjects: {
              include: {
                topics: {
                  include: {
                    userProgress: {
                      where: { userId },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!roadmap) {
      throw createAppError('Roadmap not found', 404);
    }

    let totalTopics = 0;
    let completedTopics = 0;

    roadmap.concepts.forEach((concept) => {
      concept.subjects.forEach((subject) => {
        subject.topics.forEach((topic) => {
          totalTopics++;
          if (topic.userProgress.some((p) => p.isCompleted)) {
            completedTopics++;
          }
        });
      });
    });

    return {
      totalTopics,
      completedTopics,
      progressPercentage: totalTopics
        ? (completedTopics / totalTopics) * 100
        : 0,
      roadmap,
    };
  }
}
