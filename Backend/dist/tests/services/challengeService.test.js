"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("../setup");
const challengeService_1 = require("../../services/challengeService");
const errorHandler_1 = require("../../middlewares/errorHandler");
let mockCtx;
beforeEach(() => {
    mockCtx = (0, setup_1.createMockContext)();
});
describe('ChallengeService', () => {
    describe('createChallenge', () => {
        const challengeData = {
            title: 'Test Challenge',
            description: 'Test Description',
            difficulty: 'medium',
            category: 'DSA',
            testCases: [
                { input: '1,2', output: '3', isHidden: false },
                { input: '2,3', output: '5', isHidden: true },
            ],
        };
        it('should create a new challenge with test cases', async () => {
            const mockChallenge = {
                id: 'challenge1',
                ...challengeData,
                testCases: challengeData.testCases.map((tc, i) => ({
                    id: `tc${i}`,
                    ...tc,
                })),
            };
            mockCtx.prisma.challenge.create.mockResolvedValue(mockChallenge);
            const result = await challengeService_1.ChallengeService.createChallenge(challengeData);
            expect(result).toHaveProperty('id');
            expect(result.testCases).toHaveLength(2);
        });
        it('should validate challenge data before creation', async () => {
            const invalidData = { ...challengeData, difficulty: 'invalid' };
            await expect(challengeService_1.ChallengeService.createChallenge(invalidData)).rejects.toThrow(errorHandler_1.AppError);
        });
    });
    describe('submitSolution', () => {
        const submissionData = {
            challengeId: 'challenge1',
            userId: 'user1',
            code: 'function solution(a,b) { return a + b; }',
            language: 'javascript',
        };
        it('should process successful submission', async () => {
            const mockTestResults = [
                { passed: true, input: '1,2', expected: '3', actual: '3' },
                { passed: true, input: '2,3', expected: '5', actual: '5' },
            ];
            mockCtx.prisma.challenge.findUnique.mockResolvedValue({
                id: 'challenge1',
                testCases: [
                    { input: '1,2', output: '3' },
                    { input: '2,3', output: '5' },
                ],
            });
            mockCtx.prisma.submission.create.mockResolvedValue({
                id: 'submission1',
                ...submissionData,
                status: 'passed',
                results: mockTestResults,
            });
            const result = await challengeService_1.ChallengeService.submitSolution(submissionData);
            expect(result.status).toBe('passed');
            expect(result.results).toHaveLength(2);
        });
        it('should handle failed submissions', async () => {
            const mockTestResults = [
                { passed: true, input: '1,2', expected: '3', actual: '3' },
                { passed: false, input: '2,3', expected: '5', actual: '6' },
            ];
            mockCtx.prisma.challenge.findUnique.mockResolvedValue({
                id: 'challenge1',
                testCases: [
                    { input: '1,2', output: '3' },
                    { input: '2,3', output: '5' },
                ],
            });
            mockCtx.prisma.submission.create.mockResolvedValue({
                id: 'submission1',
                ...submissionData,
                status: 'failed',
                results: mockTestResults,
            });
            const result = await challengeService_1.ChallengeService.submitSolution(submissionData);
            expect(result.status).toBe('failed');
        });
    });
    describe('getChallengeLeaderboard', () => {
        it('should return sorted leaderboard', async () => {
            const mockLeaderboard = [
                { userId: 'user1', score: 100, completionTime: 50 },
                { userId: 'user2', score: 95, completionTime: 45 },
            ];
            mockCtx.prisma.submission.groupBy.mockResolvedValue(mockLeaderboard);
            const result = await challengeService_1.ChallengeService.getChallengeLeaderboard('challenge1');
            expect(result).toHaveLength(2);
            expect(result[0].score).toBeGreaterThan(result[1].score);
        });
    });
});
//# sourceMappingURL=challengeService.test.js.map