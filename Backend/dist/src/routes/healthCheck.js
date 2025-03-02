"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../config");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        environment: config_1.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
//# sourceMappingURL=healthCheck.js.map