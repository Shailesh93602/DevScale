import { Prisma } from '@prisma/client';
import logger from '../../utils/logger';
import fs from 'fs';
import path from 'path';

import prisma from '../../lib/prisma';

interface RollbackPoint {
  timestamp: string;
  changes: {
    table: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    data: Record<string, unknown>[];
  }[];
}

// Project root for file system operations
const projectRoot = process.cwd();
const rollbacksDir = path.join(projectRoot, 'backups', 'rollbacks');

async function createRollbackPoint(): Promise<void> {
  const timestamp = new Date().toISOString();
  const rollbackData: RollbackPoint = { timestamp, changes: [] };

  // Save current state for potential rollback
  const users = await prisma.user.findMany();
  const roadmaps = await prisma.roadmap.findMany();

  rollbackData.changes = [
    { table: 'user', operation: 'INSERT', data: users },
    { table: 'roadmap', operation: 'INSERT', data: roadmaps },
  ];

  // Ensure rollback directory exists
  if (!fs.existsSync(rollbacksDir)) {
    fs.mkdirSync(rollbacksDir, { recursive: true });
  }

  // Save rollback point to file
  const filePath = path.join(rollbacksDir, `rollback_${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(rollbackData, null, 2));

  logger.info(`Created rollback point: ${timestamp}`);
}

async function rollback(timestamp: string): Promise<void> {
  try {
    const rollbackFile = path.join(rollbacksDir, `rollback_${timestamp}.json`);
    const raw = fs.readFileSync(rollbackFile, 'utf-8');
    const rollbackData: RollbackPoint = JSON.parse(raw);

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
