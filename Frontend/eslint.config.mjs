import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'react-hooks/exhaustive-deps': 'off',
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
