"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/e2e/**/*.test.ts'],
    setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.ts'],
    globalSetup: '<rootDir>/tests/e2e/globalSetup.ts',
    globalTeardown: '<rootDir>/tests/e2e/globalTeardown.ts',
    testTimeout: 30000,
};
exports.default = config;
//# sourceMappingURL=jest.config.e2e.js.map