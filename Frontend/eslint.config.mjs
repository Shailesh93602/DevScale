import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      // Naming conventions (see ../../CONVENTIONS.md). React components are
      // PascalCase functions; the data layer is snake_case.
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase'] },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: ['variable', 'parameter'],
          format: ['camelCase', 'UPPER_CASE', 'snake_case', 'PascalCase'],
          leadingUnderscore: 'allowSingleOrDouble',
        },
        { selector: ['objectLiteralProperty', 'typeProperty'], format: null },
        { selector: 'import', format: null },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'JSXAttribute[name.name=/^(className|class)$/] > Literal[value=/\\bdark:/]',
          message:
            'Tailwind dark: classes are forbidden. Use design tokens and semantic color utilities instead.',
        },
        {
          selector:
            'JSXAttribute[name.name=/^(className|class)$/] JSXExpressionContainer > Literal[value=/\\bdark:/]',
          message:
            'Tailwind dark: classes are forbidden. Use design tokens and semantic color utilities instead.',
        },
        {
          selector:
            'JSXAttribute[name.name=/^(className|class)$/] JSXExpressionContainer > TemplateLiteral > TemplateElement[value.raw=/\\bdark:/]',
          message:
            'Tailwind dark: classes are forbidden. Use design tokens and semantic color utilities instead.',
        },
        {
          selector:
            'JSXAttribute[name.name=/^(className|class)$/] > Literal[value=/\\btext-black\\b/]',
          message:
            'Hardcoded text-black breaks dark mode. Use text-foreground or text-primary-foreground instead.',
        },
        {
          selector:
            'JSXAttribute[name.name=/^(className|class)$/] > Literal[value=/\\bbg-white\\b/]',
          message:
            'Hardcoded bg-white breaks dark mode. Use bg-background or bg-card instead.',
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
