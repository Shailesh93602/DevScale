"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlacementResources = getPlacementResources;
exports.getRecommendedBooks = getRecommendedBooks;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const prisma = new client_1.PrismaClient();
async function getPlacementResources(user_id, subject_id) {
    return prisma.placementTest.findMany({
        where: {
            user_id,
            subject_id,
        },
        orderBy: {
            created_at: 'desc',
        },
    });
}
async function getRecommendedBooks(subject_id, level) {
    const books = await prisma.placementBook.findMany({
        where: {
            subject_id,
            level,
        },
        select: {
            id: true,
            title: true,
            description: true,
            file_path: true,
        },
    });
    if (books.length === 0) {
        throw (0, errorHandler_1.createAppError)('No books found for this level', 404);
    }
    return books;
}
//# sourceMappingURL=placementService.js.map