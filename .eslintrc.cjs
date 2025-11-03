module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.base.json'],
    tsconfigRootDir: __dirname
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.base.json']
      }
    }
  },
  env: {
    es2021: true,
    node: true
  },
  ignorePatterns: ['.eslintrc.cjs', 'dist', 'node_modules'],
  overrides: [
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      env: {
        browser: true,
        node: true
      }
    },
    {
      files: ['packages/ui/**/*.{ts,tsx}'],
      env: {
        browser: true
      }
    },
    {
      files: ['apps/web/public/service-worker.js'],
      env: {
        serviceworker: true
      }
    },
    {
      files: [
        'apps/web/postcss.config.js',
        'apps/web/tailwind.config.js',
        'apps/web/next.config.mjs',
        'apps/api/jest.config.js',
        'infra/**/*.js'
      ],
      env: {
        node: true
      }
    }
  ],
  rules: {
    'import/order': [
      'warn',
      {
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always'
      }
    ]
  }
};
