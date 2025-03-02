"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
const dotenv_1 = require("dotenv");
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
(0, dotenv_1.config)();
const prisma = new client_1.PrismaClient();
exports.getAllUsers = (0, utils_1.catchAsync)(async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
        },
        orderBy: { created_at: 'asc' },
    });
    res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
    });
});
//# sourceMappingURL=authController.js.map