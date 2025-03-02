"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateBody = exports.validateRequest = void 0;
const errorHandler_1 = require("../utils/errorHandler");
const validateRequest = (schema, type = 'body') => {
    return (req, _res, next) => {
        const { error, value } = schema.validate(req[type], {
            abortEarly: false,
            stripUnknown: true,
            allowUnknown: false,
        });
        console.log('🚀 ---------------------------🚀');
        console.log('🚀 ~ return ~ value:', value);
        console.log('🚀 ---------------------------🚀');
        console.log('🚀 ---------------------------🚀');
        console.log('🚀 ~ return ~ error:', error);
        console.log('🚀 ---------------------------🚀');
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, ''),
            }));
            console.error('Validation errors:', errors);
            return next((0, errorHandler_1.createAppError)('Validation failed', 400, { errors }));
        }
        // Replace validated content
        req[type] = value;
        next();
    };
};
exports.validateRequest = validateRequest;
// Specific validators using factory function
const validateBody = (schema) => (0, exports.validateRequest)(schema, 'body');
exports.validateBody = validateBody;
const validateQuery = (schema) => (0, exports.validateRequest)(schema, 'query');
exports.validateQuery = validateQuery;
const validateParams = (schema) => (0, exports.validateRequest)(schema, 'params');
exports.validateParams = validateParams;
//# sourceMappingURL=validateRequest.js.map