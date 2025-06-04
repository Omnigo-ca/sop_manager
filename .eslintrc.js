module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-this-alias': 'warn',
    '@typescript-eslint/no-empty-interface': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-empty': 'warn',
    'no-prototype-builtins': 'warn',
    'prefer-const': 'warn',
    'no-case-declarations': 'warn',
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'warn',
    'no-useless-escape': 'warn'
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'lib/generated/',
    'prisma/generated/'
  ]
} 