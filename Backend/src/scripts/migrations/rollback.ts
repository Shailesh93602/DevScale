import { Prisma } from '@prisma/client';
import logger from '../../utils/logger';
import fs from 'fs';
import path from 'path';

import prisma from '@/lib/prisma';

interface RollbackPoint {
  timestamp: string;
  changes: {
    table: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    data: Record<string, unknown>[];
  }[];
}

async function createRollbackPoint(): Promise<void> {
  const timestamp = new Date().toISOString();
  const rollbackData: RollbackPoint = {
    timestamp,
    changes: [],
  };

  // Save current state for potential rollback
  const users = await prisma.user.findMany();
  const roadmaps = await prisma.roadmap.findMany();

  rollbackData.changes = [
    { table: 'user', operation: 'INSERT', data: users },
    { table: 'roadmap', operation: 'INSERT', data: roadmaps },
  ];

  // Save rollback point to file
  const rollbackDir = path.join(__dirname, '../../../backups/rollbacks');
  if (!fs.existsSync(rollbackDir)) {
    fs.mkdirSync(rollbackDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(rollbackDir, `rollback_${timestamp}.json`),
    JSON.stringify(rollbackData, null, 2)
  );

  logger.info(`Created rollback point: ${timestamp}`);
}

async function rollback(timestamp: string): Promise<void> {
  try {
    const rollbackFile = path.join(
      __dirname,
      `../../../backups/rollbacks/rollback_${timestamp}.json`
    );
    const rollbackData: RollbackPoint = JSON.parse(
      fs.readFileSync(rollbackFile, 'utf-8')
    );

    // Perform rollback operations in reverse order
    for (const change of rollbackData.changes.reverse()) {
      switch (change.table) {
        case 'user':
          await prisma.user.deleteMany();
          await prisma.user.createMany({
            data: change.data as Prisma.UserCreateManyInput[],
          });
          break;
        case 'roadmap':
          await prisma.roadmap.deleteMany();
          await prisma.roadmap.createMany({
            data: change.data as Prisma.RoadmapCreateManyInput[],
          });
          break;
      }
    }

    logger.info(`Successfully rolled back to ${timestamp}`);
  } catch (error) {
    logger.error('Error during rollback:', error);
    throw error;
  }
}

export { createRollbackPoint, rollback };
