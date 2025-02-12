"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserProfile = createUserProfile;
exports.getUserProfile = getUserProfile;
exports.updateUserProfile = updateUserProfile;
exports.updateUserPoints = updateUserPoints;
exports.updateUserProgress = updateUserProgress;
exports.getUserProgress = getUserProgress;
exports.getAchievements = getAchievements;
exports.calculateExperienceLevel = calculateExperienceLevel;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createUserProfile(userId, data) {
    return prisma.user.create({
        data: {
            supabase_id: userId,
            experience_level: data.experienceLevel,
            ...data,
        },
    });
}
async function getUserProfile(userId) {
    return prisma.user.findUnique({
        where: { id: userId },
    });
}
async function updateUserProfile(userId, data) {
    return prisma.user.update({
        where: { id: userId },
        data,
    });
}
async function updateUserPoints(userId, points) {
    await prisma.userPoints.upsert({
        where: { userId },
        update: { points: { increment: points } },
        create: { userId, points },
    });
}
async function updateUserProgress(userId, data) {
    await prisma.userProgress.upsert({
        where: { userId_topicId: { userId, topicId: data.topicId } },
        update: {
            isCompleted: data.isCompleted,
            completedAt: data.isCompleted ? new Date() : null,
            timeSpent: data.timeSpent,
        },
        create: {
            userId,
            topicId: data.topicId,
            isCompleted: data.isCompleted,
            completedAt: data.isCompleted ? new Date() : null,
            timeSpent: data.timeSpent ?? 0,
            subjectId: '',
        },
    });
}
async function getUserProgress(userId) {
    const progress = await prisma.userProgress.findMany({
        where: { userId },
        include: {
            topic: {
                select: {
                    title: true,
                    subject: {
                        select: {
                            title: true,
                            mainConcept: {
                                select: {
                                    name: true,
                                    roadmap: {
                                        select: {
                                            title: true,
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
    const points = await prisma.userPoints.findUnique({
        where: { userId },
    });
    return {
        progress,
        totalPoints: points?.points ?? 0,
        completedTopics: progress.filter((p) => p.isCompleted).length,
        inProgressTopics: progress.filter((p) => !p.isCompleted).length,
    };
}
async function getAchievements(userId) {
    const progress = await getUserProgress(userId);
    const achievements = [];
    // Define achievement thresholds
    if (progress.totalPoints >= 1000)
        achievements.push('Points Master');
    if (progress.completedTopics >= 10)
        achievements.push('Learning Explorer');
    if (progress.completedTopics >= 50)
        achievements.push('Knowledge Warrior');
    // Add more achievements as needed
    return achievements;
}
async function calculateExperienceLevel(userId) {
    const { totalPoints } = await getUserProgress(userId);
    if (totalPoints >= 5000)
        return 'expert';
    if (totalPoints >= 2000)
        return 'advanced';
    if (totalPoints >= 500)
        return 'intermediate';
    return 'beginner';
}
//# sourceMappingURL=userService.js.map