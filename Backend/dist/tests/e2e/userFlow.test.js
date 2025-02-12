"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiTestHelper_1 = require("../helpers/apiTestHelper");
const authService_1 = require("../../services/authService");
describe('User Flow E2E Tests', () => {
    let userToken;
    beforeAll(async () => {
        userToken = await authService_1.AuthService.generateToken('test-user-1');
    });
    describe('User Journey', () => {
        it('should complete full learning path', async () => {
            // 1. Get user profile
            const profileResponse = await apiTestHelper_1.apiRequest.get('/api/v1/users/profile', userToken);
            expect(profileResponse.status).toBe(200);
            // 2. Start a roadmap
            const roadmapResponse = await apiTestHelper_1.apiRequest.post('/api/v1/roadmaps/start', { roadmapId: 'test-roadmap-1' }, userToken);
            expect(roadmapResponse.status).toBe(200);
            // 3. Complete a challenge
            const challengeResponse = await apiTestHelper_1.apiRequest.post('/api/v1/challenges/test-challenge-1/submit', {
                code: 'function solution() { return true; }',
                language: 'javascript',
            }, userToken);
            expect(challengeResponse.status).toBe(200);
            // 4. Check progress
            const progressResponse = await apiTestHelper_1.apiRequest.get('/api/v1/users/progress', userToken);
            expect(progressResponse.status).toBe(200);
            expect(progressResponse.body.progress).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=userFlow.test.js.map