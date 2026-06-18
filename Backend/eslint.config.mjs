import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['dist/**', 'node_modules/**', 'resources/**', 'coverage/**', '.next/**', 'build/**'] },
  { files: ['**/*.{mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Naming conventions (see ../../CONVENTIONS.md). The data layer is snake_case
    // (Prisma columns + API JSON keys), so destructured vars + object/type
    // properties keep snake_case; everything else is camelCase / PascalCase.
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase'] },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE', 'PascalCase', 'camelCase'],
        },
        {
          selector: ['function', 'classMethod', 'objectLiteralMethod'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Variables + params: camelCase or UPPER_CASE, with snake_case ALLOWED for
        // the data layer (this codebase consistently mirrors snake_case DB/API
        // identifiers like user_id, roadmap_id). Catches genuinely-wrong names
        // (PascalCase var, kebab, etc.) without churning the data identifiers.
        {
          selector: ['variable', 'parameter'],
          format: ['camelCase', 'UPPER_CASE', 'snake_case', 'PascalCase'],
          // _req (unused-param convention) + __filename/__dirname (Node ESM)
          leadingUnderscore: 'allowSingleOrDouble',
        },
        { selector: ['objectLiteralProperty', 'typeProperty'], format: null },
        { selector: 'import', format: null },
      ],
    },
  },
];
