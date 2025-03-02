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
exports.upsertUserProfile = upsertUserProfile;
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
async function updateUserPoints(user_id, points) {
    await prisma.userPoints.upsert({
        where: { user_id },
        update: { points: { increment: points } },
        create: { user_id, points },
    });
}
async function updateUserProgress(user_id, data) {
    await prisma.userProgress.upsert({
        where: { user_id_topic_id: { user_id, topic_id: data.topicId } },
        update: {
            is_completed: data.isCompleted,
            completed_at: data.isCompleted ? new Date() : null,
            time_spent: data.timeSpent,
        },
        create: {
            user_id,
            topic_id: data.topicId,
            is_completed: data.isCompleted,
            completed_at: data.isCompleted ? new Date() : null,
            time_spent: data.timeSpent ?? 0,
            subject_id: '',
        },
    });
}
async function getUserProgress(user_id) {
    const progress = await prisma.userProgress.findMany({
        where: { user_id },
        include: {
            topic: {
                select: {
                    title: true,
                    subjects: {
                        select: {
                            subject: {
                                select: {
                                    title: true,
                                    main_concepts: {
                                        select: {
                                            main_concept: {
                                                select: {
                                                    name: true,
                                                    roadmaps: {
                                                        select: {
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
                            },
                        },
                    },
                },
            },
        },
    });
    const points = await prisma.userPoints.findUnique({
        where: { user_id },
    });
    return {
        progress,
        total_points: points?.points ?? 0,
        completed_topics: progress.filter((p) => p.is_completed).length,
        in_progress_topics: progress.filter((p) => !p.is_completed).length,
    };
}
async function getAchievements(userId) {
    const progress = await getUserProgress(userId);
    const achievements = [];
    // Define achievement thresholds
    if (progress.total_points >= 1000)
        achievements.push('Points Master');
    if (progress.completed_topics >= 10)
        achievements.push('Learning Explorer');
    if (progress.completed_topics >= 50)
        achievements.push('Knowledge Warrior');
    // Add more achievements as needed
    return achievements;
}
async function calculateExperienceLevel(user_id) {
    const { total_points } = await getUserProgress(user_id);
    if (total_points >= 5000)
        return 'expert';
    if (total_points >= 2000)
        return 'advanced';
    if (total_points >= 500)
        return 'intermediate';
    return 'beginner';
}
async function upsertUserProfile(data) {
    return prisma.user.upsert({
        where: { supabase_id: data.supabase_id },
        create: {
            ...data,
            role: { connect: { name: 'STUDENT' } },
        },
        update: {
            ...data,
            role: { connect: { name: 'STUDENT' } },
            updated_at: new Date(),
        },
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            specialization: true,
            college: true,
        },
    });
}
//# sourceMappingURL=userService.js.map