"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiTestHelper_1 = require("../helpers/apiTestHelper");
const setup_1 = require("../setup");
const authService_1 = require("../../services/authService");
describe('User Endpoints', () => {
    const mockContext = (0, setup_1.createMockContext)();
    let authToken;
    beforeEach(async () => {
        authToken = await authService_1.AuthService.generateToken('user123');
    });
    describe('GET /api/v1/users/profile', () => {
        it('should return user profile', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/users/profile', authToken);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('profile');
        });
    });
    describe('PATCH /api/v1/users/profile', () => {
        const updateData = {
            username: 'newusername',
            bio: 'Updated bio',
        };
        it('should update user profile', async () => {
            const response = await apiTestHelper_1.apiRequest.put('/api/v1/users/profile', updateData, authToken);
            expect(response.status).toBe(200);
            expect(response.body.profile.username).toBe(updateData.username);
        });
        it('should validate update data', async () => {
            const response = await apiTestHelper_1.apiRequest.put('/api/v1/users/profile', { username: '' }, authToken);
            expect(response.status).toBe(400);
        });
    });
    describe('GET /api/v1/users/:userId/progress', () => {
        it('should return user progress', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/users/user123/progress', authToken);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('progress');
        });
    });
});
//# sourceMappingURL=userEndpoints.test.js.map