"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLearningPathRecommendations = getLearningPathRecommendations;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../../utils/logger"));
const analytics_1 = require("./analytics");
const prisma = new client_1.PrismaClient();
async function getLearningPathRecommendations(userId) {
    try {
        const [userProgress, userSkills, completedTopics] = await Promise.all([
            (0, analytics_1.getUserProgress)(userId),
            getUserSkills(userId),
            getCompletedTopics(userId),
        ]);
        return {
            nextTopics: await getNextTopics(userId, completedTopics),
            relatedRoadmaps: await getRelatedRoadmaps(userSkills),
            challengeRecommendations: await getChallengeRecommendations(userId, userProgress.progressPercentage),
            skillGaps: await identifySkillGaps(userId, userSkills),
            progressStats: {
                completedTopics: userProgress.completedTopics,
                totalTopics: userProgress.totalTopics,
                progressPercentage: userProgress.progressPercentage,
                recentActivity: userProgress.recentActivity,
            },
        };
    }
    catch (error) {
        logger_1.default.error('Failed to generate recommendations:', error);
        throw error;
    }
}
async function getUserSkills(userId) {
    const profile = await prisma.user.findUnique({
        where: { id: userId },
        select: { skills: true },
    });
    return profile?.skills || [];
}
async function getCompletedTopics(userId) {
    return prisma.progress.findMany({
        where: { userId, status: client_1.Status.APPROVED },
        select: { topicId: true },
    });
}
async function getNextTopics(userId, completedTopics) {
    const completedIds = completedTopics.map((t) => t.topicId);
    return prisma.topic.findMany({
        where: {
            id: { notIn: completedIds },
            roadmaps: {
                some: {
                    progress: { some: { userId, status: client_1.Status.APPROVED } },
                },
            },
        },
        orderBy: { order: 'asc' },
        take: 5,
    });
}
async function getRelatedRoadmaps(userSkills) {
    return prisma.roadmap.findMany({
        where: {
            topics: {
                some: {
                    OR: [
                        { content: { contains: userSkills[0] } },
                        ...userSkills.slice(1).map((skill) => ({
                            content: { contains: skill },
                        })),
                    ],
                },
            },
        },
        take: 3,
    });
}
async function getChallengeRecommendations(userId, progressPercentage) {
    const userLevel = await getUserLevel(userId);
    const difficulty = mapProgressToDifficulty(progressPercentage, userLevel);
    return prisma.challenge.findMany({
        where: {
            difficulty,
            submissions: { none: { userId } },
        },
        take: 5,
    });
}
async function identifySkillGaps(userId, userSkills) {
    const popularSkills = await prisma.user.findMany({
        select: { skills: true },
        take: 100,
    });
    const skillFrequency = popularSkills.reduce((acc, profile) => {
        profile.skills.forEach((skill) => {
            acc[skill] = (acc[skill] || 0) + 1;
        });
        return acc;
    }, {});
    return Object.entries(skillFrequency)
        .filter(([skill]) => !userSkills.includes(skill))
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([skill]) => skill);
}
// Helper functions
async function getUserLevel(userId) {
    const profile = await prisma.user.findUnique({
        where: { id: userId },
        select: { experience_level: true },
    });
    return profile?.experience_level;
}
function mapProgressToDifficulty(progressPercentage, level) {
    if (level === 'EXPERT' || progressPercentage > 90)
        return 'HARD';
    if (level === 'ADVANCED' || progressPercentage > 70)
        return 'MEDIUM';
    return 'EASY';
}
//# sourceMappingURL=recommendations.js.map