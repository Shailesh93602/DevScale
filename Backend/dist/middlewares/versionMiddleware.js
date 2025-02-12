"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkApiVersion = void 0;
const errorHandler_1 = require("../utils/errorHandler");
const checkApiVersion = (req, res, next) => {
    const version = req.headers['x-api-version'];
    if (!version) {
        return next();
    }
    // Currently supported versions
    const supportedVersions = ['1.0', '1.1'];
    if (!supportedVersions.includes(version)) {
        throw (0, errorHandler_1.createAppError)('API version not supported', 400);
    }
    req.apiVersion = version;
    next();
};
exports.checkApiVersion = checkApiVersion;
//# sourceMappingURL=versionMiddleware.js.map