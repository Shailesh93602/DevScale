"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateUserData = migrateUserData;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../../utils/logger"));
const prisma = new client_1.PrismaClient();
async function migrateUserData() {
    try {
        // Get all users that need migration
        const users = await prisma.user.findMany({
            where: {
                profile: null, // Users without profiles
            },
        });
        logger_1.default.info(`Found ${users.length} users to migrate`);
        // Create profiles for users
        for (const user of users) {
            await prisma.profile.create({
                data: {
                    userId: user.id,
                    username: user.username || `user_${user.id}`,
                    bio: '',
                    avatar: null,
                },
            });
            logger_1.default.info(`Created profile for user ${user.id}`);
        }
        logger_1.default.info('User data migration completed successfully');
    }
    catch (error) {
        logger_1.default.error('Error during user data migration:', error);
        throw error;
    }
}
//# sourceMappingURL=userDataMigration.js.map