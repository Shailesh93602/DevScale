"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const autocannon_1 = __importDefault(require("autocannon"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const STRESS_LEVELS = [
    { users: 100, duration: 30 },
    { users: 250, duration: 30 },
    { users: 500, duration: 30 },
    { users: 1000, duration: 30 },
];
const CRITICAL_ENDPOINTS = [
    '/api/v1/auth/login',
    '/api/v1/challenges/submit',
    '/api/v1/articles/create',
];
async function runStressTest() {
    const results = [];
    for (const endpoint of CRITICAL_ENDPOINTS) {
        const endpointResults = [];
        for (const level of STRESS_LEVELS) {
            const result = await (0, autocannon_1.default)({
                url: `http://localhost:3000${endpoint}`,
                connections: level.users,
                duration: level.duration,
                timeout: 20,
            });
            endpointResults.push({
                users: level.users,
                latency: result.latency.average,
                errorRate: (result.errors / result.requests.total) * 100,
                throughput: result.throughput.average,
            });
        }
        results.push({
            endpoint,
            results: endpointResults,
        });
    }
    (0, fs_1.writeFileSync)(path_1.default.join(__dirname, 'stressTestResults.json'), JSON.stringify(results, null, 2));
}
exports.default = runStressTest;
//# sourceMappingURL=stressTest.js.map