"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopicsInSubject = exports.getAllSubjects = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const index_1 = require("../utils/index");
exports.getAllSubjects = (0, index_1.catchAsync)(async (req, res) => {
    const subjects = await prisma_1.default.subject.findMany({
        include: {
            mainConcept: {
                select: {
                    id: true,
                    name: true,
                },
                // orderBy: {
                //   createdAt: 'asc',
                // },
            },
        },
        orderBy: {
            created_at: 'asc',
        },
    });
    res.status(200).json(subjects);
});
exports.getTopicsInSubject = (0, index_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const subject = await prisma_1.default.subject.findUnique({
        where: { id },
        include: {
            topics: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                },
                orderBy: {
                    created_at: 'asc',
                },
                include: {
                    articles: {
                        select: {
                            id: true,
                            title: true,
                            content: true,
                        },
                        where: {
                            status: 'APPROVED',
                        },
                        orderBy: {
                            created_at: 'asc',
                        },
                    },
                },
            },
        },
    });
    if (subject) {
        res.status(200).json(subject.topics);
    }
    else {
        res.status(404).json({ message: 'Subject not found' });
    }
});
//# sourceMappingURL=subjectController.js.map