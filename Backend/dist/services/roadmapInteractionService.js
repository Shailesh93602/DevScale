"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoadmapInteractionService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RoadmapInteractionService {
    static async addComment(data) {
        const comment = await prisma.comment.create({
            data: {
                content: data.content,
                userId: data.userId,
                roadmapId: data.roadmapId,
                parentId: data.parentId,
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
        return comment;
    }
    static async getRoadmapComments(roadmapId) {
        const comments = await prisma.comment.findMany({
            where: {
                roadmapId,
                parentId: null, // Get only top-level comments
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
        return comments;
    }
    static async toggleLike(userId, roadmapId) {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_roadmapId: {
                    userId,
                    roadmapId,
                },
            },
        });
        if (existingLike) {
            await prisma.like.delete({
                where: {
                    userId_roadmapId: {
                        userId,
                        roadmapId,
                    },
                },
            });
        }
        else {
            await prisma.like.create({
                data: {
                    userId,
                    roadmapId,
                },
            });
        }
    }
    static async getRecommendedRoadmaps(userId) {
        // Get user's interests based on their saved roadmaps and completed topics
        const userInterests = await prisma.userRoadmap.findMany({
            where: { userId },
            include: {
                roadmap: {
                    include: {
                        concepts: {
                            include: {
                                subjects: true,
                            },
                        },
                    },
                },
            },
        });
        // Extract topics and subjects of interest
        const interests = new Set();
        userInterests.forEach((ur) => {
            ur.roadmap.concepts.forEach((concept) => {
                concept.subjects.forEach((subject) => {
                    interests.add(subject.title.toLowerCase());
                });
            });
        });
        // Find roadmaps with similar topics
        const recommendedRoadmaps = await prisma.roadmap.findMany({
            where: {
                isPublic: true,
                NOT: {
                    id: {
                        in: userInterests.map((ur) => ur.roadmapId),
                    },
                },
                concepts: {
                    some: {
                        subjects: {
                            some: {
                                title: {
                                    in: Array.from(interests),
                                    mode: 'insensitive',
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
        return recommendedRoadmaps;
    }
    static async getEngagementMetrics(roadmapId) {
        const [likes, comments, saves] = await Promise.all([
            prisma.like.count({
                where: { roadmapId },
            }),
            prisma.comment.count({
                where: { roadmapId },
            }),
            prisma.userRoadmap.count({
                where: { roadmapId },
            }),
        ]);
        return {
            likes,
            comments,
            saves,
            engagementScore: likes * 2 + comments * 3 + saves * 5, // Weighted score
        };
    }
    static async shareRoadmap(roadmapId, platform) {
        // Generate sharing links based on platform
        const baseUrl = process.env.FRONTEND_URL;
        const roadmapUrl = `${baseUrl}/roadmaps/${roadmapId}`;
        const sharingUrls = {
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(roadmapUrl)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(roadmapUrl)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(roadmapUrl)}`,
        };
        return sharingUrls[platform] || roadmapUrl;
    }
}
exports.RoadmapInteractionService = RoadmapInteractionService;
//# sourceMappingURL=roadmapInteractionService.js.map