"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRollbackPoint = createRollbackPoint;
exports.rollback = rollback;
const logger_1 = __importDefault(require("../../utils/logger"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("@/lib/prisma"));
async function createRollbackPoint() {
    const timestamp = new Date().toISOString();
    const rollbackData = {
        timestamp,
        changes: [],
    };
    // Save current state for potential rollback
    const users = await prisma_1.default.user.findMany();
    const roadmaps = await prisma_1.default.roadmap.findMany();
    rollbackData.changes = [
        { table: 'user', operation: 'INSERT', data: users },
        { table: 'roadmap', operation: 'INSERT', data: roadmaps },
    ];
    // Save rollback point to file
    const rollbackDir = path_1.default.join(__dirname, '../../../backups/rollbacks');
    if (!fs_1.default.existsSync(rollbackDir)) {
        fs_1.default.mkdirSync(rollbackDir, { recursive: true });
    }
    fs_1.default.writeFileSync(path_1.default.join(rollbackDir, `rollback_${timestamp}.json`), JSON.stringify(rollbackData, null, 2));
    logger_1.default.info(`Created rollback point: ${timestamp}`);
}
async function rollback(timestamp) {
    try {
        const rollbackFile = path_1.default.join(__dirname, `../../../backups/rollbacks/rollback_${timestamp}.json`);
        const rollbackData = JSON.parse(fs_1.default.readFileSync(rollbackFile, 'utf-8'));
        // Perform rollback operations in reverse order
        for (const change of rollbackData.changes.reverse()) {
            switch (change.table) {
                case 'user':
                    await prisma_1.default.user.deleteMany();
                    await prisma_1.default.user.createMany({
                        data: change.data,
                    });
                    break;
                case 'roadmap':
                    await prisma_1.default.roadmap.deleteMany();
                    await prisma_1.default.roadmap.createMany({
                        data: change.data,
                    });
                    break;
            }
        }
        logger_1.default.info(`Successfully rolled back to ${timestamp}`);
    }
    catch (error) {
        logger_1.default.error('Error during rollback:', error);
        throw error;
    }
}
//# sourceMappingURL=rollback.js.map