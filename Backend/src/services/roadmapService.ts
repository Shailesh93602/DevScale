import { createAppError } from '../middlewares/errorHandler';
import { getCache, setCache, deleteCache } from './cacheService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RoadmapData {
  title: string;
  description: string;
  author_id: string;
  is_public?: boolean;
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
  subject_id: string;
  order: number;
}

interface UserRoadmapData {
  user_id: string;
  roadmap_id: string;
  topic_id: string;
  is_custom?: boolean;
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
          user: { connect: { id: data.author_id } },
          is_public: data.is_public ?? false,
          main_concepts: {
            create: data.concepts?.map((concept) => ({
              name: concept.title,
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
          main_concepts: {
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
        main_concepts: {
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
        is_public: data.is_public,
      },
      include: {
        main_concepts: {
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

  static async addConcept(roadmap_id: string, data: ConceptData) {
    const concept = await prisma.mainConcept.create({
      data: {
        name: data.title,
        description: data.description,
        order: data.order,
        roadmap: { connect: { id: roadmap_id } },
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

  static async addSubject(main_concept_id: string, data: SubjectData) {
    const subject = await prisma.subject.create({
      data: {
        title: data.title,
        description: data.description,
        order: data.order,
        main_concept: { connect: { id: main_concept_id } },
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

  static async addTopic(subject_id: string, data: TopicData) {
    const topic = await prisma.topic.create({
      data: {
        ...data,
        subject_id,
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

    await deleteCache('roadmaps:all');
    return progress;
  }

  static async getAllRoadmaps(user_id?: string) {
    const roadmaps = await prisma.roadmap.findMany({
      include: {
        main_concepts: {
          include: {
            subjects: true,
          },
        },
        user_roadmaps: {
          where: user_id ? { user_id } : undefined,
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
    roadmap_id: string,
    subject_orders: SubjectOrder[]
  ): Promise<void> {
    await prisma.$transaction(
      subject_orders.map((order) =>
        prisma.subject.update({
          where: { id: order.subject_id },
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
          user: { connect: { id: data.author_id } },
          is_public: data.is_public ?? false,
        },
      });

      // If cloning from existing roadmap
      if (data.sourceRoadmapId) {
        const sourceRoadmap = await tx.roadmap.findUnique({
          where: { id: data.sourceRoadmapId },
          include: {
            main_concepts: {
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
        for (const main_concept of sourceRoadmap.main_concepts) {
          const newMainConcept = await tx.mainConcept.create({
            data: {
              name: main_concept.name,
              description: main_concept.description,
              roadmap_id: newRoadmap.id,
              order: main_concept.order,
            },
          });

          for (const subject of main_concept.subjects) {
            const newSubject = await tx.subject.create({
              data: {
                title: subject.title,
                description: subject.description,
                order: subject.order,
                main_concept_id: newMainConcept.id,
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
        user: { connect: { id: data.user_id } },
        roadmap: { connect: { id: data.roadmap_id } },
        is_custom: data.is_custom ?? false,
        topic: { connect: { id: data.topic_id } },
      },
      include: {
        roadmap: {
          include: {
            main_concepts: {
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

  static async getUserRoadmaps(user_id: string) {
    const userRoadmaps = await prisma.userRoadmap.findMany({
      where: { user_id },
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

  static async updateRoadmapPrivacy(id: string, is_public: boolean) {
    const roadmap = await prisma.roadmap.update({
      where: { id },
      data: { is_public },
    });

    await deleteCache('roadmaps:all');
    return roadmap;
  }

  static async getPublicRoadmaps(filters?: {
    search?: string;
    author_id?: string;
    sort?: 'popular' | 'recent';
  }) {
    const roadmaps = await prisma.roadmap.findMany({
      where: {
        is_public: true,
        user_id: filters?.author_id,
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
            main_concepts: true,
          },
        },
      },
      orderBy:
        filters?.sort === 'popular'
          ? { likes: { _count: 'desc' } }
          : { created_at: 'desc' },
    });

    return roadmaps;
  }

  static async getRoadmapProgress(user_id: string, roadmap_id: string) {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmap_id },
      include: {
        main_concepts: {
          include: {
            subjects: {
              include: {
                topics: {
                  include: {
                    user_progress: {
                      where: { user_id },
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

    roadmap.main_concepts.forEach((concept) => {
      concept.subjects.forEach((subject) => {
        subject.topics.forEach((topic) => {
          totalTopics++;
          if (topic.user_progress.some((p) => p.is_completed)) {
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
