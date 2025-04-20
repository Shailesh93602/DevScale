import { FlatCompat } from '@eslint/eslintrc';

// Use the project root as the base directory for ESLint compatibility
const baseDirectory = process.cwd();

const compat = new FlatCompat({
  baseDirectory,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];

export default eslintConfig;
