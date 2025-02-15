import { PrismaClient, Forum, ForumPost, ForumComment } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';

const prisma = new PrismaClient();

interface ForumData {
  title: string;
  description: string;
  user_id: string;
  tags?: string[];
}

interface PostData {
  title: string;
  content: string;
  user_id: string;
  forum_id: string;
  tags?: string[];
}

interface CommentData {
  content: string;
  user_id: string;
  post_id: string;
  parent_id?: string;
}

export const createForum = async (data: ForumData): Promise<Forum> => {
  return prisma.forum.create({
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
};

export const createPost = async (data: PostData): Promise<ForumPost> => {
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
};

export const createComment = async (
  data: CommentData
): Promise<ForumComment> => {
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
};

export const getForums = async (filters?: { tags?: string[] }) => {
  return prisma.forum.findMany({
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
};

export const getForum = async (id: string): Promise<Forum> => {
  const forum = await prisma.forum.findUnique({
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
};

export const getPost = async (id: string): Promise<ForumPost> => {
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
};

export const updatePost = async (
  id: string,
  data: Partial<PostData>
): Promise<ForumPost> => {
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
};

export const deletePost = async (id: string): Promise<void> => {
  await prisma.forumPost.delete({
    where: { id },
  });
};

export const upvotePost = async (
  post_id: string,
  user_id: string
): Promise<void> => {
  await prisma.forumPost.update({
    where: { id: post_id },
    data: {
      upvotes: { increment: 1 },
      user_id,
    },
  });
};

export const upvoteComment = async (
  comment_id: string,
  user_id: string
): Promise<void> => {
  await prisma.forumComment.update({
    where: { id: comment_id },
    data: {
      upvotes: { increment: 1 },
      user_id,
    },
  });
};
