/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
        diagnostics: {
          // TS2823 = "Import attributes are only supported when '--module' is
          // esnext/node18/nodenext/preserve". The app builds with
          // module: ESNext, where `import json from './x.json' with { type:
          // 'json' }` is correct; only this CommonJS test transform rejects it.
          //
          // The consequence was not cosmetic: resourceController.ts failed to
          // LOAD under Jest, so it — and every route that imports it — was
          // untestable, silently. Nothing failed, because nothing could run.
          // The attribute is erased by the CommonJS emit anyway (resolveJsonModule
          // turns it into a require), so ignoring the diagnostic changes no
          // behaviour and no production output.
          ignoreCodes: [2823],
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/tests/**',
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/__tests__/',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  maxWorkers: '50%',
  detectOpenHandles: true,
  forceExit: true,
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest-setup.ts'],
};
