"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("../setup");
const roadmapService_1 = require("../../services/roadmapService");
const errorHandler_1 = require("../../middlewares/errorHandler");
let mockCtx;
beforeEach(() => {
    mockCtx = (0, setup_1.createMockContext)();
});
describe('RoadmapService', () => {
    describe('createRoadmap', () => {
        const roadmapData = {
            title: 'Test Roadmap',
            description: 'Test Description',
            topics: ['topic1', 'topic2'],
            userId: 'user1',
        };
        it('should create a new roadmap', async () => {
            const mockRoadmap = { id: 'roadmap1', ...roadmapData };
            mockCtx.prisma.roadmap.create.mockResolvedValue(mockRoadmap);
            const result = await roadmapService_1.RoadmapService.createRoadmap(roadmapData);
            expect(result).toHaveProperty('id');
            expect(result.title).toBe(roadmapData.title);
        });
    });
    describe('getRoadmapProgress', () => {
        it('should return roadmap progress', async () => {
            const mockProgress = {
                completed: 5,
                total: 10,
                topics: [
                    { id: 'topic1', completed: true },
                    { id: 'topic2', completed: false },
                ],
            };
            mockCtx.prisma.userProgress.findMany.mockResolvedValue(mockProgress.topics);
            const result = await roadmapService_1.RoadmapService.getRoadmapProgress('roadmap1', 'user1');
            expect(result).toHaveProperty('completed');
            expect(result).toHaveProperty('total');
        });
    });
    describe('updateRoadmap', () => {
        it('should update roadmap details', async () => {
            const updateData = {
                title: 'Updated Roadmap',
                description: 'Updated Description',
            };
            mockCtx.prisma.roadmap.update.mockResolvedValue({
                id: 'roadmap1',
                ...updateData,
            });
            const result = await roadmapService_1.RoadmapService.updateRoadmap('roadmap1', updateData);
            expect(result.title).toBe(updateData.title);
        });
        it('should throw error for non-existent roadmap', async () => {
            mockCtx.prisma.roadmap.update.mockRejectedValue(new Error('Record not found'));
            await expect(roadmapService_1.RoadmapService.updateRoadmap('nonexistent', { title: 'New Title' })).rejects.toThrow(errorHandler_1.AppError);
        });
    });
});
//# sourceMappingURL=roadmapService.test.js.map