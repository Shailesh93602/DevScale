"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../../app");
const supertest_1 = __importDefault(require("supertest"));
describe('Security Configuration Tests', () => {
    describe('Security Headers', () => {
        it('should set secure headers', async () => {
            const response = await (0, supertest_1.default)(app_1.app).get('/');
            expect(response.headers['x-frame-options']).toBe('DENY');
            expect(response.headers['x-xss-protection']).toBe('1; mode=block');
            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['strict-transport-security']).toBeDefined();
        });
        it('should set correct CORS headers', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .options('/')
                .set('Origin', 'http://localhost:3000');
            expect(response.headers['access-control-allow-origin']).toBeDefined();
            expect(response.headers['access-control-allow-methods']).toBeDefined();
        });
    });
    describe('Cookie Security', () => {
        it('should set secure cookie attributes', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/api/v1/auth/login')
                .send({ email: 'test@example.com', password: 'password' });
            const cookies = response.headers['set-cookie'] || [];
            cookies.forEach((cookie) => {
                expect(cookie).toContain('HttpOnly');
                expect(cookie).toContain('SameSite=Strict');
                if (process.env.NODE_ENV === 'production') {
                    expect(cookie).toContain('Secure');
                }
            });
        });
    });
});
//# sourceMappingURL=configTests.js.map