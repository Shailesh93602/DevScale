"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cacheControl_1 = require("../../middlewares/cacheControl");
const cacheService_1 = require("../../services/cacheService");
jest.mock('../../services/cacheService');
describe('Cache Control Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;
    beforeEach(() => {
        mockReq = {
            method: 'GET',
            originalUrl: '/test',
        };
        mockRes = {
            json: jest.fn(),
        };
        nextFunction = jest.fn();
    });
    describe('cacheResponse', () => {
        it('should return cached data if available', async () => {
            const cachedData = { data: 'test' };
            cacheService_1.CacheService.get.mockResolvedValue(JSON.stringify(cachedData));
            const middleware = (0, cacheControl_1.cacheResponse)({ duration: 60 });
            await middleware(mockReq, mockRes, nextFunction);
            expect(mockRes.json).toHaveBeenCalledWith(cachedData);
            expect(nextFunction).not.toHaveBeenCalled();
        });
        it('should call next() and set up response caching if no cached data', async () => {
            cacheService_1.CacheService.get.mockResolvedValue(null);
            const middleware = (0, cacheControl_1.cacheResponse)({ duration: 60 });
            await middleware(mockReq, mockRes, nextFunction);
            expect(nextFunction).toHaveBeenCalled();
            expect(typeof mockRes.json).toBe('function');
        });
    });
});
//# sourceMappingURL=cacheControl.test.js.map