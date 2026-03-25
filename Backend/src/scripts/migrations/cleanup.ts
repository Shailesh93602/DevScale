import logger from '../../utils/logger';

import prisma from '@/lib/prisma';

async function cleanupData() {
  try {
    // Remove duplicate emails
    const duplicateEmails = await prisma.$queryRaw`
      SELECT email, COUNT(*)
      FROM "User"
      GROUP BY email
      HAVING COUNT(*) > 1
    `;

    for (const { email } of duplicateEmails as { email: string }[]) {
      const users = await prisma.user.findMany({
        where: { email },
        orderBy: { created_at: 'asc' },
      });

      // Keep the oldest user, delete the rest
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [keep, ...remove] = users;
      await prisma.user.deleteMany({
        where: {
          email,
          id: { in: remove.map((u) => u.id) },
        },
      });
    }

    // Clean up soft-deleted records older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.user.deleteMany({
      where: {
        deleted_at: {
          lt: thirtyDaysAgo,
        },
      },
    });

    logger.info('Data cleanup completed successfully');
  } catch (error) {
    logger.error('Error during data cleanup:', error);
    throw error;
  }
}

export { cleanupData };
