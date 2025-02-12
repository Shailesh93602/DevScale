"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rbacMiddleware_1 = require("../../middlewares/rbacMiddleware");
const rbacService_1 = require("../../services/rbacService");
const errorHandler_1 = require("../../middlewares/errorHandler");
jest.mock('../../services/rbacService');
describe('RBAC Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;
    beforeEach(() => {
        mockReq = {
            user: { id: 'user123' },
        };
        mockRes = {};
        nextFunction = jest.fn();
    });
    describe('requirePermission', () => {
        it('should call next() when user has permission', async () => {
            rbacService_1.RBACService.checkPermission.mockResolvedValue(true);
            const middleware = (0, rbacMiddleware_1.requirePermission)('resource', 'action');
            await middleware(mockReq, mockRes, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith();
        });
        it('should call next(error) when user lacks permission', async () => {
            rbacService_1.RBACService.checkPermission.mockResolvedValue(false);
            const middleware = (0, rbacMiddleware_1.requirePermission)('resource', 'action');
            await middleware(mockReq, mockRes, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(errorHandler_1.AppError));
        });
        it('should handle unauthorized requests', async () => {
            mockReq.user = undefined;
            const middleware = (0, rbacMiddleware_1.requirePermission)('resource', 'action');
            await middleware(mockReq, mockRes, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(errorHandler_1.AppError));
        });
    });
});
//# sourceMappingURL=rbacMiddleware.test.js.map