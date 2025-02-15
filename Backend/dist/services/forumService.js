"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upvoteComment = exports.upvotePost = exports.deletePost = exports.updatePost = exports.getPost = exports.getForum = exports.getForums = exports.createComment = exports.createPost = exports.createForum = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const prisma = new client_1.PrismaClient();
const createForum = async (data) => {
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
exports.createForum = createForum;
const createPost = async (data) => {
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
exports.createPost = createPost;
const createComment = async (data) => {
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
exports.createComment = createComment;
const getForums = async (filters) => {
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
exports.getForums = getForums;
const getForum = async (id) => {
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
    if (!forum)
        throw (0, errorHandler_1.createAppError)('Forum not found', 404);
    return forum;
};
exports.getForum = getForum;
const getPost = async (id) => {
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
    if (!post)
        throw (0, errorHandler_1.createAppError)('Post not found', 404);
    return post;
};
exports.getPost = getPost;
const updatePost = async (id, data) => {
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
exports.updatePost = updatePost;
const deletePost = async (id) => {
    await prisma.forumPost.delete({
        where: { id },
    });
};
exports.deletePost = deletePost;
const upvotePost = async (post_id, user_id) => {
    await prisma.forumPost.update({
        where: { id: post_id },
        data: {
            upvotes: { increment: 1 },
            user_id,
        },
    });
};
exports.upvotePost = upvotePost;
const upvoteComment = async (comment_id, user_id) => {
    await prisma.forumComment.update({
        where: { id: comment_id },
        data: {
            upvotes: { increment: 1 },
            user_id,
        },
    });
};
exports.upvoteComment = upvoteComment;
//# sourceMappingURL=forumService.js.map