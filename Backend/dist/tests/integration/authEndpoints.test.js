"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiTestHelper_1 = require("../helpers/apiTestHelper");
const setup_1 = require("../setup");
const authService_1 = require("../../services/authService");
describe('Auth Endpoints', () => {
    const mockContext = (0, setup_1.createMockContext)();
    describe('POST /api/v1/auth/login', () => {
        const loginData = {
            email: 'test@example.com',
            password: 'password123',
        };
        it('should login successfully with valid credentials', async () => {
            const response = await apiTestHelper_1.apiRequest.post('/api/v1/auth/login', loginData);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
        });
        it('should reject invalid credentials', async () => {
            const response = await apiTestHelper_1.apiRequest.post('/api/v1/auth/login', {
                ...loginData,
                password: 'wrongpassword',
            });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('GET /api/v1/auth/me', () => {
        it('should return user profile with valid token', async () => {
            const token = await authService_1.AuthService.generateToken('user123');
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/auth/me', token);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
        });
        it('should reject unauthorized request', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/auth/me');
            expect(response.status).toBe(401);
        });
    });
});
//# sourceMappingURL=authEndpoints.test.js.map