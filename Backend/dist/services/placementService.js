"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlacementResources = getPlacementResources;
exports.getRecommendedBooks = getRecommendedBooks;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const prisma = new client_1.PrismaClient();
async function getPlacementResources(userId, subjectId) {
    return prisma.placementTest.findMany({
        where: {
            userId,
            subjectId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}
async function getRecommendedBooks(subjectId, level) {
    const books = await prisma.placementBook.findMany({
        where: {
            subjectId,
            level,
        },
        select: {
            id: true,
            title: true,
            description: true,
            filePath: true,
        },
    });
    if (books.length === 0) {
        throw (0, errorHandler_1.createAppError)('No books found for this level', 404);
    }
    return books;
}
//# sourceMappingURL=placementService.js.map