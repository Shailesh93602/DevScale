"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopicStreak = exports.markTopicComplete = exports.getDailyTopic = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const prisma = new client_1.PrismaClient();
const getDailyTopic = async (user_id) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Check if a daily topic is already set for today
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dailyTopic = await prisma.dailyTopic.findFirst({
        where: {
            date: today,
        },
        include: {
            topic: {
                include: {
                    subject: {
                        include: {
                            main_concept: true,
                        },
                    },
                    articles: {
                        where: {
                            status: client_1.Status.APPROVED,
                        },
                    },
                    quizzes: true,
                    challenges: true,
                },
            },
            _count: {
                select: {
                    views: true,
                    completions: true,
                },
            },
        },
    });
    // If no daily topic exists for today, select and create one
    if (!dailyTopic) {
        const topic = await selectNewDailyTopic();
        dailyTopic = await prisma.dailyTopic.create({
            data: {
                topic_id: topic.id,
                date: today,
            },
            include: {
                topic: {
                    include: {
                        subject: {
                            include: {
                                main_concept: true,
                            },
                        },
                        articles: {
                            where: {
                                status: client_1.Status.APPROVED,
                            },
                        },
                        quizzes: true,
                        challenges: true,
                    },
                },
                _count: {
                    select: {
                        views: true,
                        completions: true,
                    },
                },
            },
        });
    }
    // Track user view if user_id is provided
    if (user_id) {
        await trackUserView(dailyTopic.id, user_id);
    }
    return {
        ...dailyTopic,
        stats: await getDailyTopicStats(dailyTopic.id),
    };
};
exports.getDailyTopic = getDailyTopic;
const selectNewDailyTopic = async () => {
    // Get topics that haven't been daily topics recently
    const recentDailyTopics = await prisma.dailyTopic.findMany({
        orderBy: {
            date: 'desc',
        },
        take: 30, // Don't repeat topics from the last 30 days
        select: {
            topic_id: true,
        },
    });
    const recentTopicIds = recentDailyTopics.map((dt) => dt.topic_id);
    // Select a topic that:
    // 1. Hasn't been featured recently
    // 2. Has approved articles
    // 3. Has quizzes or challenges
    // 4. Preferably has high engagement
    const eligibleTopic = await prisma.topic.findFirst({
        where: {
            NOT: {
                id: {
                    in: recentTopicIds,
                },
            },
            articles: {
                some: {
                    status: client_1.Status.APPROVED,
                },
            },
            OR: [
                {
                    quizzes: {
                        some: {},
                    },
                },
                {
                    challenges: {
                        some: {},
                    },
                },
            ],
        },
        orderBy: {
            user_progress: {
                _count: 'desc',
            },
        },
    });
    if (!eligibleTopic) {
        throw (0, errorHandler_1.createAppError)('No eligible topics found for daily topic', 500);
    }
    return eligibleTopic;
};
const trackUserView = async (daily_topic_id, user_id) => {
    await prisma.dailyTopicView.upsert({
        where: {
            user_id_daily_topic_id: {
                user_id: user_id,
                daily_topic_id,
            },
        },
        update: {
            view_count: {
                increment: 1,
            },
        },
        create: {
            user_id: user_id,
            daily_topic_id,
            view_count: 1,
        },
    });
};
const markTopicComplete = async (daily_topic_id, user_id) => {
    await prisma.dailyTopicCompletion.create({
        data: {
            user_id,
            daily_topic_id,
            time_spent: 0, // You can track actual time spent if needed
        },
    });
    // Create achievement if user completes 7 consecutive daily topics
    const consecutiveCompletions = await getConsecutiveCompletions(user_id);
    if (consecutiveCompletions >= 7) {
        await prisma.achievement.create({
            data: {
                user_id,
                type: 'daily_topic',
                title: 'Weekly Warrior',
                description: 'Completed daily topics for 7 consecutive days!',
                criteria: {
                    consecutiveCompletions: 7,
                },
                earned_at: new Date(),
            },
        });
    }
};
exports.markTopicComplete = markTopicComplete;
const getConsecutiveCompletions = async (user_id) => {
    const completions = await prisma.dailyTopicCompletion.findMany({
        where: {
            user_id,
        },
        orderBy: {
            created_at: 'desc',
        },
        include: {
            daily_topic: true,
        },
    });
    let consecutive = 0;
    let lastDate = new Date();
    for (const completion of completions) {
        const completionDate = completion.daily_topic.date;
        const diffDays = Math.floor((lastDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            consecutive++;
            lastDate = completionDate;
        }
        else {
            break;
        }
    }
    return consecutive;
};
const getDailyTopicStats = async (daily_topic_id) => {
    const [views, completions] = await Promise.all([
        prisma.dailyTopicView.aggregate({
            where: {
                daily_topic_id,
            },
            _sum: {
                view_count: true,
            },
        }),
        prisma.dailyTopicCompletion.findMany({
            where: {
                daily_topic_id,
            },
            select: {
                time_spent: true,
            },
        }),
    ]);
    const totalViews = views._sum.view_count || 0;
    const totalCompletions = completions.length;
    const averageTimeSpent = completions.reduce((acc, c) => acc + c.time_spent, 0) /
        (completions.length || 1);
    return {
        views: totalViews,
        completions: totalCompletions,
        averageTimeSpent,
        engagementRate: totalViews ? totalCompletions / totalViews : 0,
    };
};
const getTopicStreak = async (user_id) => {
    const completions = await prisma.dailyTopicCompletion.findMany({
        where: {
            user_id: user_id,
        },
        orderBy: {
            created_at: 'desc',
        },
        include: {
            daily_topic: true,
        },
    });
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = new Date();
    for (const completion of completions) {
        const completionDate = completion.daily_topic.date;
        const diffDays = Math.floor((lastDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
            if (currentStreak === 0) {
                currentStreak = tempStreak;
            }
            lastDate = completionDate;
        }
        else {
            tempStreak = 0;
            if (currentStreak === 0) {
                currentStreak = 1;
            }
            break;
        }
    }
    return {
        currentStreak,
        longestStreak,
    };
};
exports.getTopicStreak = getTopicStreak;
//# sourceMappingURL=dailyTopicService.js.map