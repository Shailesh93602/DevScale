"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responseTransformer_1 = require("../../middlewares/responseTransformer");
describe('Response Transformer Middleware', () => {
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
    describe('transformResponse', () => {
        it('should transform response data', () => {
            const transform = (data) => ({ ...data, extra: true });
            const middleware = (0, responseTransformer_1.transformResponse)({ transform });
            middleware(mockReq, mockRes, nextFunction);
            const modifiedJson = mockRes.json;
            modifiedJson({ test: 'data' });
            expect(mockRes.json).toHaveBeenCalledWith({
                test: 'data',
                extra: true,
            });
        });
    });
    describe('sanitizeResponse', () => {
        it('should remove sensitive fields', () => {
            const data = {
                id: 1,
                username: 'test',
                _internal: 'secret',
                password: 'hash',
                nested: {
                    _hidden: true,
                    visible: 'data',
                },
            };
            (0, responseTransformer_1.sanitizeResponse)(mockReq, mockRes, nextFunction);
            mockRes.json(data);
            expect(mockRes.json).toHaveBeenCalledWith({
                id: 1,
                username: 'test',
                nested: {
                    visible: 'data',
                },
            });
        });
    });
    describe('camelCaseResponse', () => {
        it('should convert snake_case to camelCase', () => {
            const data = {
                user_id: 1,
                first_name: 'John',
                nested_object: {
                    created_at: '2023-01-01',
                },
            };
            (0, responseTransformer_1.camelCaseResponse)(mockReq, mockRes, nextFunction);
            mockRes.json(data);
            expect(mockRes.json).toHaveBeenCalledWith({
                userId: 1,
                firstName: 'John',
                nestedObject: {
                    createdAt: '2023-01-01',
                },
            });
        });
    });
});
//# sourceMappingURL=responseTransformer.test.js.map