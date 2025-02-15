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
async function getLearningPathRecommendations(user_id) {
    try {
        const [userProgress, userSkills, completedTopics] = await Promise.all([
            (0, analytics_1.getUserProgress)(user_id),
            getUserSkills(user_id),
            getCompletedTopics(user_id),
        ]);
        return {
            nextTopics: await getNextTopics(user_id, completedTopics),
            relatedRoadmaps: await getRelatedRoadmaps(userSkills),
            challengeRecommendations: await getChallengeRecommendations(user_id, userProgress.progress_percentage),
            skillGaps: await identifySkillGaps(user_id, userSkills),
            progressStats: {
                completed_topics: userProgress.completed_topics,
                total_topics: userProgress.total_topics,
                progress_percentage: userProgress.progress_percentage,
                recent_activity: userProgress.recent_activity,
            },
        };
    }
    catch (error) {
        logger_1.default.error('Failed to generate recommendations:', error);
        throw error;
    }
}
async function getUserSkills(user_id) {
    const profile = await prisma.user.findUnique({
        where: { id: user_id },
        select: { skills: true },
    });
    return profile?.skills || [];
}
async function getCompletedTopics(user_id) {
    return prisma.progress.findMany({
        where: { user_id: user_id, status: client_1.Status.APPROVED },
        select: { topic_id: true },
    });
}
async function getNextTopics(user_id, completed_topics) {
    const completed_ids = completed_topics.map((t) => t.topic_id);
    return prisma.topic.findMany({
        where: {
            id: { notIn: completed_ids },
            roadmaps: {
                some: {
                    progress: { some: { user_id: user_id, status: client_1.Status.APPROVED } },
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
async function getChallengeRecommendations(user_id, progress_percentage) {
    const user_level = await getUserLevel(user_id);
    const difficulty = mapProgressToDifficulty(progress_percentage, user_level);
    return prisma.challenge.findMany({
        where: {
            difficulty,
            submissions: { none: { user_id } },
        },
        take: 5,
    });
}
async function identifySkillGaps(user_id, user_skills) {
    const popular_skills = await prisma.user.findMany({
        select: { skills: true },
        take: 100,
    });
    const skill_frequency = popular_skills.reduce((acc, profile) => {
        profile.skills.forEach((skill) => {
            acc[skill] = (acc[skill] || 0) + 1;
        });
        return acc;
    }, {});
    return Object.entries(skill_frequency)
        .filter(([skill]) => !user_skills.includes(skill))
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([skill]) => skill);
}
// Helper functions
async function getUserLevel(user_id) {
    const profile = await prisma.user.findUnique({
        where: { id: user_id },
        select: { experience_level: true },
    });
    return profile?.experience_level;
}
function mapProgressToDifficulty(progress_percentage, level) {
    if (level === 'EXPERT' || progress_percentage > 90)
        return 'HARD';
    if (level === 'ADVANCED' || progress_percentage > 70)
        return 'MEDIUM';
    return 'EASY';
}
//# sourceMappingURL=recommendations.js.map