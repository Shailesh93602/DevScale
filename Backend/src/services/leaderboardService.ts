import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getLeaderboard(
  subjectId: string,
  timeRange: string,
  limit: number
) {
  const timeFilter = getTimeFilter(timeRange);

  return prisma.leaderboardEntry.findMany({
    where: {
      subjectId,
      createdAt: timeFilter,
    },
    orderBy: [{ score: 'desc' }, { timeTaken: 'asc' }],
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          avatar_url: true,
        },
      },
    },
  });
}

function getTimeFilter(timeRange: string) {
  const now = new Date();
  const filters: Record<string, { gte: Date }> = {
    daily: { gte: new Date(now.setDate(now.getDate() - 1)) },
    weekly: { gte: new Date(now.setDate(now.getDate() - 7)) },
    monthly: { gte: new Date(now.setMonth(now.getMonth() - 1)) },
    all: { gte: new Date(0) },
  };

  return filters[timeRange];
}
