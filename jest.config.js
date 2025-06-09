/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Pour supporter les tests de composants React
  testMatch: [
    '**/?(*.)+(spec|test).[tj]s?(x)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }]
  },
  moduleNameMapper: {
    // Gestion des alias Next.js
    '^@/(.*)$': '<rootDir>/$1',
    // Gestion des imports de styles
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  
  // ============== CONFIGURATION COVERAGE ==============
  collectCoverage: false, // false par défaut, true avec --coverage
  collectCoverageFrom: [
    // Inclure tous les fichiers source
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    // Exclure les fichiers spécifiques
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!app/layout.tsx', // Souvent difficile à tester
    '!app/globals.css',
    '!**/*.config.{js,ts}',
    '!**/types.ts', // Types uniquement
  ],
  
  coverageDirectory: 'coverage',
  
  coverageReporters: [
    'text',           // Affichage dans le terminal
    'text-summary',   // Résumé dans le terminal
    'html',           // Interface HTML interactive
    'lcov',           // Pour les outils externes (Codecov, etc.)
    'json-summary',   // Données JSON
  ],
  
  // Seuils de couverture - désactivés en mode CI pour le serving
  coverageThreshold: process.env.SKIP_COVERAGE_THRESHOLD ? undefined : {
    global: {
      branches: 40,
      functions: 40,
      lines: 50,
      statements: 50,
    },
    // Seuils spécifiques pour les composants bien testés
    './components/sop-manager/empty-state.tsx': {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85,
    },
  },
  
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/prisma/',
    '/public/',
    '\\.(css|less|scss|sass)$',
    '/components/ui/', // Exclusion des composants UI de base
    '/docs/', // Exclusion de la documentation
    '/lib/generated/', // Exclusion du code généré
    '/scripts/', // Scripts utilitaires
    '/styles/', // Fichiers CSS
    '/.github/', // Configuration CI/CD
    '/.clerk/', // Configuration Clerk
    '/data/', // Données statiques
  ],
} 