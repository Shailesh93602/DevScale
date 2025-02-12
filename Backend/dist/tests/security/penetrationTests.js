"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiTestHelper_1 = require("../helpers/apiTestHelper");
describe('Security Penetration Tests', () => {
    describe('Authentication Security', () => {
        it('should prevent brute force attacks', async () => {
            const attempts = Array(10)
                .fill(null)
                .map(() => apiTestHelper_1.apiRequest.post('/api/v1/auth/login', {
                email: 'test@example.com',
                password: 'wrongpass',
            }));
            const responses = await Promise.all(attempts);
            const lastResponse = responses[responses.length - 1];
            expect(lastResponse.status).toBe(429); // Too Many Requests
        });
        it('should validate JWT tokens properly', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/users/profile', 'invalid.jwt.token');
            expect(response.status).toBe(401);
        });
    });
    describe('Input Validation Security', () => {
        it('should prevent SQL injection', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/users?search=1%27%20OR%20%271%27=%271');
            expect(response.status).toBe(400);
        });
        it('should prevent XSS attacks', async () => {
            const response = await apiTestHelper_1.apiRequest.post('/api/v1/articles', {
                title: '<script>alert("xss")</script>',
                content: '<img src="x" onerror="alert(1)">',
            });
            expect(response.body.title).not.toContain('<script>');
            expect(response.body.content).not.toContain('onerror');
        });
        it('should prevent NoSQL injection', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/users?filter={"$gt": ""}');
            expect(response.status).toBe(400);
        });
    });
    describe('Authorization Security', () => {
        it('should prevent privilege escalation', async () => {
            const userToken = 'normal.user.token';
            const response = await apiTestHelper_1.apiRequest.post('/api/v1/admin/users/role', { userId: '123', role: 'admin' }, userToken);
            expect(response.status).toBe(403);
        });
        it('should enforce resource isolation', async () => {
            const userToken = 'user1.token';
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/users/user2/private-data', userToken);
            expect(response.status).toBe(403);
        });
    });
    describe('Rate Limiting', () => {
        it('should enforce API rate limits', async () => {
            const requests = Array(100)
                .fill(null)
                .map(() => apiTestHelper_1.apiRequest.get('/api/v1/public-endpoint'));
            const responses = await Promise.all(requests);
            const rateLimited = responses.some((r) => r.status === 429);
            expect(rateLimited).toBe(true);
        });
    });
});
//# sourceMappingURL=penetrationTests.js.map