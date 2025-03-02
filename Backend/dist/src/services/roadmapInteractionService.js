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
        return comment;
    }
    static async getRoadmapComments(roadmap_id) {
        const comments = await prisma.comment.findMany({
            where: {
                roadmap_id,
                parent_id: null, // Get only top-level comments
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
    static async toggleLike(user_id, roadmap_id) {
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
        }
        else {
            await prisma.like.create({
                data: {
                    user_id,
                    roadmap_id,
                },
            });
        }
    }
    static async getRecommendedRoadmaps(user_id) {
        // Get user's interests based on their saved roadmaps and completed topics
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
        // Extract topics and subjects of interest
        const interests = new Set();
        userInterests.forEach((ur) => {
            ur.roadmap.main_concepts.forEach((concept) => {
                concept.main_concept.subjects.forEach((subject) => {
                    interests.add(subject.subject.title.toLowerCase());
                });
            });
        });
        // Find roadmaps with similar topics
        const recommendedRoadmaps = await prisma.roadmap.findMany({
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
        return recommendedRoadmaps;
    }
    static async getEngagementMetrics(roadmap_id) {
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