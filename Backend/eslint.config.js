import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { 
    ignores: ['dist/**', 'resources/**', 'node_modules/**', '**/temp_wrapper.js'] 
  },
  { files: ['**/*.{mjs,cjs,ts,js}'] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['**/seeders/**', 'prisma/seed.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
