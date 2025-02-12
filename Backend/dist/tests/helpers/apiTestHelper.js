"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRequest = exports.createTestToken = void 0;
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = __importDefault(require("../../config"));
const createTestToken = (userId, roles = ['user']) => {
    return (0, jsonwebtoken_1.sign)({ id: userId, roles }, config_1.default.jwt.secret, {
        expiresIn: '1h',
    });
};
exports.createTestToken = createTestToken;
exports.apiRequest = {
    get: (url, token) => {
        const req = (0, supertest_1.default)(app_1.app).get(url);
        if (token)
            req.set('Authorization', `Bearer ${token}`);
        return req;
    },
    post: (url, data, token) => {
        const req = (0, supertest_1.default)(app_1.app).post(url).send(data);
        if (token)
            req.set('Authorization', `Bearer ${token}`);
        return req;
    },
    put: (url, data, token) => {
        const req = (0, supertest_1.default)(app_1.app).put(url).send(data);
        if (token)
            req.set('Authorization', `Bearer ${token}`);
        return req;
    },
    delete: (url, token) => {
        const req = (0, supertest_1.default)(app_1.app).delete(url);
        if (token)
            req.set('Authorization', `Bearer ${token}`);
        return req;
    },
};
//# sourceMappingURL=apiTestHelper.js.map