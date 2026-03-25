/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'out/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  {
    rules: {
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];
