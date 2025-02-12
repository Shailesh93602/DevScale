"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiTestHelper_1 = require("../helpers/apiTestHelper");
describe('Security Tests', () => {
    describe('Authentication', () => {
        it('should reject requests without token', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/protected-route');
            expect(response.status).toBe(401);
        });
        it('should reject invalid tokens', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/protected-route', 'invalid-token');
            expect(response.status).toBe(401);
        });
    });
    describe('Rate Limiting', () => {
        it('should enforce rate limits', async () => {
            const requests = Array(100)
                .fill(null)
                .map(() => apiTestHelper_1.apiRequest.get('/api/v1/public-route'));
            const responses = await Promise.all(requests);
            const tooManyRequests = responses.filter((r) => r.status === 429);
            expect(tooManyRequests.length).toBeGreaterThan(0);
        });
    });
    describe('Input Validation', () => {
        it('should sanitize SQL injection attempts', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/users?query=1%27%20OR%20%271%27=%271');
            expect(response.status).toBe(400);
        });
        it('should sanitize XSS attempts', async () => {
            const response = await apiTestHelper_1.apiRequest.post('/api/v1/comments', {
                content: '<script>alert("xss")</script>',
            });
            expect(response.body.content).not.toContain('<script>');
        });
    });
});
//# sourceMappingURL=securityTests.js.map