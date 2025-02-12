"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const validateRequest_1 = require("../../middlewares/validateRequest");
const errorHandler_1 = require("../../middlewares/errorHandler");
describe('Validation Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;
    beforeEach(() => {
        mockReq = {};
        mockRes = {
            json: jest.fn(),
        };
        nextFunction = jest.fn();
    });
    const testSchema = joi_1.default.object({
        name: joi_1.default.string().required(),
        age: joi_1.default.number().min(18),
    });
    describe('validateRequest', () => {
        it('should pass validation for valid data', async () => {
            const data = { name: 'John', age: 25 };
            await expect((0, validateRequest_1.validateRequest)(testSchema, data)).resolves.not.toThrow();
        });
        it('should throw AppError for invalid data', async () => {
            const data = { age: 15 };
            await expect((0, validateRequest_1.validateRequest)(testSchema, data)).rejects.toThrow(errorHandler_1.AppError);
        });
    });
    describe('validateBody', () => {
        it('should call next() for valid body', async () => {
            mockReq.body = { name: 'John', age: 25 };
            const middleware = (0, validateRequest_1.validateBody)(testSchema);
            await middleware(mockReq, mockRes, nextFunction);
            expect(nextFunction).toHaveBeenCalled();
        });
        it('should call next(error) for invalid body', async () => {
            mockReq.body = { age: 15 };
            const middleware = (0, validateRequest_1.validateBody)(testSchema);
            await middleware(mockReq, mockRes, nextFunction);
            expect(nextFunction).toHaveBeenCalledWith(expect.any(errorHandler_1.AppError));
        });
    });
});
//# sourceMappingURL=validateRequest.test.js.map