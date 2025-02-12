"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("../setup");
const userService_1 = require("../../services/userService");
const errorHandler_1 = require("../../middlewares/errorHandler");
let mockCtx;
beforeEach(() => {
    mockCtx = (0, setup_1.createMockContext)();
});
describe('UserService', () => {
    describe('createUser', () => {
        const userData = {
            email: 'test@example.com',
            username: 'testuser',
            password: 'password123',
        };
        it('should create a new user successfully', async () => {
            const mockCreatedUser = { id: 'user1', ...userData };
            mockCtx.prisma.user.create.mockResolvedValue(mockCreatedUser);
            const result = await userService_1.UserService.createUser(userData);
            expect(result).toHaveProperty('id');
            expect(result.email).toBe(userData.email);
        });
        it('should throw error for duplicate email', async () => {
            mockCtx.prisma.user.create.mockRejectedValue(new Error('Unique constraint failed'));
            await expect(userService_1.UserService.createUser(userData)).rejects.toThrow(errorHandler_1.AppError);
        });
    });
    describe('updateProfile', () => {
        it('should update user profile', async () => {
            const updateData = {
                username: 'newusername',
                bio: 'New bio',
            };
            mockCtx.prisma.user.update.mockResolvedValue({
                id: 'user1',
                ...updateData,
            });
            const result = await userService_1.UserService.updateProfile('user1', updateData);
            expect(result.username).toBe(updateData.username);
        });
    });
    describe('getUserProfile', () => {
        it('should return user profile with related data', async () => {
            const mockUser = {
                id: 'user1',
                username: 'testuser',
                email: 'test@example.com',
                profile: {
                    bio: 'Test bio',
                    avatar: 'avatar.jpg',
                },
            };
            mockCtx.prisma.user.findUnique.mockResolvedValue(mockUser);
            const result = await userService_1.UserService.getUserProfile('user1');
            expect(result).toHaveProperty('profile');
            expect(result.username).toBe(mockUser.username);
        });
        it('should throw error for non-existent user', async () => {
            mockCtx.prisma.user.findUnique.mockResolvedValue(null);
            await expect(userService_1.UserService.getUserProfile('nonexistent')).rejects.toThrow(errorHandler_1.AppError);
        });
    });
});
//# sourceMappingURL=userService.test.js.map