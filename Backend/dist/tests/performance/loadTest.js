"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const autocannon_1 = __importDefault(require("autocannon"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const endpoints = [
    { url: '/api/v1/users', method: 'GET' },
    { url: '/api/v1/roadmaps', method: 'GET' },
    { url: '/api/v1/challenges', method: 'GET' },
];
const runLoadTest = async () => {
    const results = [];
    for (const endpoint of endpoints) {
        const result = await (0, autocannon_1.default)({
            url: `http://localhost:3000${endpoint.url}`,
            connections: 10,
            pipelining: 1,
            duration: 10,
            method: endpoint.method,
        });
        results.push({
            endpoint: endpoint.url,
            method: endpoint.method,
            averageLatency: result.latency.average,
            requestsPerSecond: result.requests.average,
            errors: result.errors,
            timeouts: result.timeouts,
        });
    }
    (0, fs_1.writeFileSync)(path_1.default.join(__dirname, 'loadTestResults.json'), JSON.stringify(results, null, 2));
};
exports.default = runLoadTest;
//# sourceMappingURL=loadTest.js.map