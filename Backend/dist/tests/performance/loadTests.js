"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const autocannon_1 = __importDefault(require("autocannon"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const TEST_DURATION = 30; // seconds
const CONCURRENT_USERS = 50;
const endpoints = [
    { name: 'Get User Profile', method: 'GET', url: '/api/v1/users/profile' },
    { name: 'List Roadmaps', method: 'GET', url: '/api/v1/roadmaps' },
    { name: 'List Challenges', method: 'GET', url: '/api/v1/challenges' },
    {
        name: 'Search Articles',
        method: 'GET',
        url: '/api/v1/articles/search?q=test',
    },
];
async function runLoadTest() {
    const results = [];
    const token = 'test-token'; // Add test token for authenticated endpoints
    for (const endpoint of endpoints) {
        const instance = (0, autocannon_1.default)({
            url: `http://localhost:3000${endpoint.url}`,
            connections: CONCURRENT_USERS,
            duration: TEST_DURATION,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            method: endpoint.method,
        });
        const result = await new Promise((resolve) => {
            instance.on('done', resolve);
        });
        results.push({
            endpoint: endpoint.name,
            method: endpoint.method,
            averageLatency: result.latency.average,
            requestsPerSecond: result.requests.average,
            errors: result.errors,
            timeouts: result.timeouts,
            p99Latency: result.latency.p99,
            totalRequests: result.requests.total,
            throughput: result.throughput.average,
        });
    }
    // Save results
    (0, fs_1.writeFileSync)(path_1.default.join(__dirname, 'loadTestResults.json'), JSON.stringify(results, null, 2));
    // Log summary
    console.table(results.map((r) => ({
        endpoint: r.endpoint,
        rps: r.requestsPerSecond.toFixed(2),
        avgLatency: r.averageLatency.toFixed(2),
        p99: r.p99Latency.toFixed(2),
        errors: r.errors,
    })));
}
exports.default = runLoadTest;
//# sourceMappingURL=loadTests.js.map