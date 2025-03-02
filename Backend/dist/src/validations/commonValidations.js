"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUUID = void 0;
const express_validator_1 = require("express-validator");
const validateUUID = (field) => (0, express_validator_1.check)(field).isUUID('4').withMessage('Invalid UUID format');
exports.validateUUID = validateUUID;
//# sourceMappingURL=commonValidations.js.map