"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInsertionValidator = void 0;
const express_validator_1 = require("express-validator");
exports.userInsertionValidator = [
    (0, express_validator_1.body)('fullName').notEmpty().withMessage('Full name is required'),
    (0, express_validator_1.body)('dob').isDate().withMessage('Date of birth must be a valid date'),
    (0, express_validator_1.body)('gender')
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be either male, female, or other'),
    (0, express_validator_1.body)('mobile')
        .isMobilePhone('en-IN')
        .withMessage('Mobile number must be a valid phone number'),
    (0, express_validator_1.body)('address').notEmpty().withMessage('Address is required'),
    (0, express_validator_1.body)('university').notEmpty().withMessage('University is required'),
    (0, express_validator_1.body)('college').notEmpty().withMessage('College is required'),
    (0, express_validator_1.body)('branch').notEmpty().withMessage('Branch is required'),
    (0, express_validator_1.body)('semester')
        .isInt({ min: 1, max: 8 })
        .withMessage('Semester must be between 1 and 8'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        next();
    },
];
//# sourceMappingURL=userValidators.js.map