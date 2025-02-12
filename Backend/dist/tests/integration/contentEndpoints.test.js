"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiTestHelper_1 = require("../helpers/apiTestHelper");
const setup_1 = require("../setup");
const authService_1 = require("../../services/authService");
describe('Content Endpoints', () => {
    const mockContext = (0, setup_1.createMockContext)();
    let authToken;
    beforeEach(async () => {
        authToken = await authService_1.AuthService.generateToken('user123');
    });
    describe('POST /api/v1/articles', () => {
        const articleData = {
            title: 'Test Article',
            content: 'Test content',
            topicId: 'topic123',
        };
        it('should create new article', async () => {
            const response = await apiTestHelper_1.apiRequest.post('/api/v1/articles', articleData, authToken);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('article');
        });
        it('should validate article data', async () => {
            const response = await apiTestHelper_1.apiRequest.post('/api/v1/articles', { title: '' }, authToken);
            expect(response.status).toBe(400);
        });
    });
    describe('GET /api/v1/articles/:articleId', () => {
        it('should return article details', async () => {
            const response = await apiTestHelper_1.apiRequest.get('/api/v1/articles/article123');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('article');
        });
    });
    describe('POST /api/v1/articles/:articleId/moderate', () => {
        const moderationData = {
            status: 'approved',
            notes: 'Content approved',
        };
        it('should moderate article with admin token', async () => {
            const adminToken = await authService_1.AuthService.generateToken('admin123');
            const response = await apiTestHelper_1.apiRequest.post('/api/v1/articles/article123/moderate', moderationData, adminToken);
            expect(response.status).toBe(200);
            expect(response.body.article.status).toBe('approved');
        });
    });
});
//# sourceMappingURL=contentEndpoints.test.js.map