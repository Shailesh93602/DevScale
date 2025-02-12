"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("../setup");
const authService_1 = require("../../services/authService");
const errorHandler_1 = require("../../middlewares/errorHandler");
let mockCtx;
beforeEach(() => {
    mockCtx = (0, setup_1.createMockContext)();
});
describe('AuthService', () => {
    describe('validateUser', () => {
        it('should validate user with correct credentials', async () => {
            const mockUser = {
                id: 'user1',
                email: 'test@example.com',
                password: 'hashedPassword',
            };
            mockCtx.prisma.user.findUnique.mockResolvedValue(mockUser);
            const result = await authService_1.AuthService.validateUser('test@example.com', 'password');
            expect(result).toHaveProperty('id', mockUser.id);
        });
        it('should throw error for non-existent user', async () => {
            mockCtx.prisma.user.findUnique.mockResolvedValue(null);
            await expect(authService_1.AuthService.validateUser('nonexistent@example.com', 'password')).rejects.toThrow(errorHandler_1.AppError);
        });
    });
    describe('generateToken', () => {
        it('should generate valid JWT token', () => {
            const userId = 'user1';
            const token = authService_1.AuthService.generateToken(userId);
            expect(typeof token).toBe('string');
            expect(token).toMatch(/^[\w-]*\.[\w-]*\.[\w-]*$/); // JWT format
        });
    });
});
//# sourceMappingURL=authService.test.js.map