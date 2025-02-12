"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubjectsInMainConcept = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const index_1 = require("../utils/index");
exports.getSubjectsInMainConcept = (0, index_1.catchAsync)(async (req, res) => {
    const { mainConceptId } = req.params;
    if (isNaN(Number(mainConceptId))) {
        return res.status(400).json({ message: 'Invalid mainConceptId' });
    }
    const mainConcept = await prisma_1.default.mainConcept.findUnique({
        where: { id: mainConceptId },
        include: {
            subjects: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                },
                orderBy: {
                    created_at: 'asc',
                },
            },
        },
    });
    if (!mainConcept) {
        return res.status(404).json({ message: 'Main Concept not found' });
    }
    res.status(200).json({
        status: 'success',
        data: mainConcept.subjects,
    });
});
//# sourceMappingURL=mainConceptController.js.map