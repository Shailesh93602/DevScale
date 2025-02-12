"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileValidation = void 0;
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
exports.updateProfileValidation = [
    (0, express_validator_1.body)('full_name')
        .optional()
        .isLength({ min: 2 })
        .withMessage('Full name must be at least 2 characters long'),
    (0, express_validator_1.body)('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),
    (0, express_validator_1.body)('github_url').optional().isURL().withMessage('Invalid GitHub URL'),
    (0, express_validator_1.body)('linkedin_url').optional().isURL().withMessage('Invalid LinkedIn URL'),
    (0, express_validator_1.body)('website').optional().isURL().withMessage('Invalid website URL'),
    (0, express_validator_1.body)('graduation_year')
        .optional()
        .isInt({ min: 1950, max: 2030 })
        .withMessage('Invalid graduation year'),
    (0, express_validator_1.body)('skills').optional().isArray().withMessage('Skills must be an array'),
    (0, express_validator_1.body)('experience_level')
        .optional()
        .isIn(Object.values(client_1.ExperienceLevel))
        .withMessage('Invalid experience level'),
];
//# sourceMappingURL=profileValidation.js.map