"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateData = validateData;
const logger_1 = __importDefault(require("../../utils/logger"));
const prisma_1 = __importDefault(require("@/lib/prisma"));
async function validateData() {
    const errors = [];
    try {
        // Validate user data
        const users = await prisma_1.default.user.findMany();
        for (const user of users) {
            // Check required fields
            if (!user.email) {
                errors.push({
                    entity: 'User',
                    id: user.id,
                    field: 'email',
                    error: 'Missing email',
                });
            }
            // Check email format
            if (user.email && !user.email.includes('@')) {
                errors.push({
                    entity: 'User',
                    id: user.id,
                    field: 'email',
                    error: 'Invalid email format',
                });
            }
        }
        // Validate roadmap data
        const roadmaps = await prisma_1.default.roadmap.findMany();
        for (const roadmap of roadmaps) {
            if (!roadmap.title) {
                errors.push({
                    entity: 'Roadmap',
                    id: roadmap.id,
                    field: 'title',
                    error: 'Missing title',
                });
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    catch (error) {
        logger_1.default.error('Error during data validation:', error);
        throw error;
    }
}
//# sourceMappingURL=dataValidation.js.map