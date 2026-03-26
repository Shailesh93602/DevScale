/* global afterAll */
// Global Jest setup/teardown file
// This file runs after each test file

import { redis } from '../services/cacheService';
import prisma from '../lib/prisma';

afterAll(async () => {
    // Give Jest a moment to detect any remaining open handles
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Close Redis connection if it's connected
    try {
        if (redis.status === 'ready') {
            await redis.quit();
        }
    } catch (error) {
        console.log('Redis already disconnected or error:', error);
    }

    // Close Prisma connection
    try {
        await prisma.$disconnect();
    } catch (error) {
        console.log('Prisma already disconnected or error:', error);
    }
});
