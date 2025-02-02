"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidator = exports.forgotPasswordValidator = exports.loginValidator = exports.registerValidator = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidator = [
    (0, express_validator_1.body)('username')
        .isLength({ min: 3 })
        .withMessage('Name must be of 3 characters long.')
        .matches(/^[A-Za-z\s]+$/)
        .withMessage('Name must be alphabetic.'),
    (0, express_validator_1.body)('email')
        .isByteLength({ min: 6 })
        .withMessage('Please provide a valid email address')
        .isEmail()
        .withMessage('Invalid email...!!')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 character long...!!'),
];
exports.loginValidator = [
    (0, express_validator_1.body)('username')
        .isLength({ min: 3 })
        .withMessage('Name must be of 3 characters long.'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 character long...!!'),
];
exports.forgotPasswordValidator = [
    (0, express_validator_1.body)('email')
        .isByteLength({ min: 6 })
        .withMessage('Please provide a valid email address')
        .isEmail()
        .withMessage('Invalid email...!!')
        .normalizeEmail(),
];
exports.resetPasswordValidator = [
    (0, express_validator_1.body)('token').isLength({ min: 3 }).withMessage('invalid token.'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 character long...!!'),
];
//# sourceMappingURL=authValidators.js.map