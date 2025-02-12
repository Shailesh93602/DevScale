"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiTestHelper_1 = require("../helpers/apiTestHelper");
const setup_1 = require("../setup");
const authService_1 = require("../../services/authService");
describe('Admin Endpoints', () => {
    const mockContext = (0, setup_1.createMockContext)();
    let adminToken;
    beforeEach(async () => {
        adminToken = await authService_1.AuthService.generateToken('admin123');
    });
    describe('GET /api/v1/admin/dashboard', () => {
        it('should return dashboard metrics', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/admin/dashboard', adminToken);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('metrics');
        });
    });
    describe('GET /api/v1/admin/users', () => {
        it('should return user list with pagination', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/admin/users?page=1&limit=10', adminToken);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('users');
            expect(response.body).toHaveProperty('pagination');
        });
    });
    describe('POST /api/v1/admin/users/:userId/role', () => {
        const roleData = {
            roleId: 'moderator',
        };
        it('should update user role', async () => {
            const response = await apiTestHelper_1.apiRequest.post('/api/v1/admin/users/user123/role', roleData, adminToken);
            expect(response.status).toBe(200);
            expect(response.body.user.role).toBe('moderator');
        });
    });
    describe('GET /api/v1/admin/audit-logs', () => {
        it('should return audit logs with filters', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/admin/audit-logs?type=user_action', adminToken);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('logs');
        });
    });
});
//# sourceMappingURL=adminEndpoints.test.js.map