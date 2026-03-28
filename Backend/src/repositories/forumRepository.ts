import { PrismaClient, Forum, ForumPost, ForumComment } from '@prisma/client';
import { createAppError } from '../utils/errorHandler.js';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export class ForumRepository extends BaseRepository< Forum, typeof prisma.forum > {
  constructor() {
    super(prisma.forum);
  }

  async createForum(data: {
    title: string;
    content: string;
    tags?: string[];
    user_id: string;
  }): Promise<Forum> {
    return this.create({
      data: {
        ...data,
        user: { connect: { id: data.user_id } },
        tags: data.tags || [],
      },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async createPost(data: {
    forum_id: string;
    title: string;
    content: string;
    tags?: string[];
    user_id: string;
  }): Promise<ForumPost> {
    return prisma.forumPost.create({
      data: {
        ...data,
        tags: data.tags || [],
      },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async createComment(data: {
    post_id: string;
    content: string;
    user_id: string;
  }): Promise<ForumComment> {
    return prisma.forumComment.create({
      data,
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async getForums(filters?: { tags?: string[] }) {
    return this.findMany({
      where: {
        tags: filters?.tags ? { array_contains: filters.tags } : undefined,
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
            posts: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getForum(id: string): Promise<Forum> {
    const forum = await this.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
        posts: {
          include: {
            user: {
              select: {
                username: true,
                avatar_url: true,
              },
            },
            _count: {
              select: {
                comments: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!forum) throw createAppError('Forum not found', 404);
    return forum;
  }

  async getPost(id: string): Promise<ForumPost> {
    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
        comments: {
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
          where: {
            parent_id: null,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!post) throw createAppError('Post not found', 404);
    return post;
  }

  async updatePost(
    id: string,
    data: Partial<{
      title: string;
      content: string;
      tags: string[];
    }>
  ): Promise<ForumPost> {
    return prisma.forumPost.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async deletePost(id: string): Promise<void> {
    await prisma.forumPost.delete({
      where: { id },
    });
  }

  async upvotePost(post_id: string, user_id: string): Promise<void> {
    await prisma.forumPost.update({
      where: { id: post_id },
      data: {
        upvotes: { increment: 1 },
        user_id,
      },
    });
  }

  async upvoteComment(comment_id: string, user_id: string): Promise<void> {
    await prisma.forumComment.update({
      where: { id: comment_id },
      data: {
        upvotes: { increment: 1 },
        user_id,
      },
    });
  }
}
