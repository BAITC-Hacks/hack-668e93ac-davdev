import { defineConfig } from 'oxlint'

export default defineConfig({
  categories: {
    correctness: 'error',
    nursery: 'warn',
    pedantic: 'warn',
    perf: 'warn',
    restriction: 'error',
    style: 'warn',
    suspicious: 'error',
  },
  env: {
    builtin: true,
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    'src-tauri',
    'src/components/react-bits/**',
    '**/*.js',
    '**/*.mjs',
  ],
  jsPlugins: [
    {
      name: 'vite-plus',
      specifier: 'vite-plus/oxlint-plugin',
    },
  ],
  options: {
    reportUnusedDisableDirectives: 'error',
    typeAware: true,
    typeCheck: true,
  },
  overrides: [
    {
      files: ['src/utils/logger.ts'],
      rules: {
        'eslint/no-console': 'off',
      },
    },
    {
      files: ['src/vite-env.d.ts', 'pwa-assets.config.ts'],
      rules: {
        'import/unambiguous': 'off',
        'unicorn/filename-case': 'off',
      },
    },
    {
      files: ['vite.config.ts'],
      env: {
        node: true,
      },
    },
    {
      files: ['**/*.{ts,tsx}'],
      env: {
        browser: true,
      },
    },
  ],
  plugins: [
    'react',
    'react-perf',
    'import',
    'promise',
    'node',
    'eslint',
    'typescript',
    'unicorn',
    'oxc',
  ],
  rules: {
    'eslint/max-lines-per-function': ['warn', { max: 500 }],
    'import/max-dependencies': ['warn', { max: 30 }],
    'max-statements': ['warn', { max: 30 }],
    'react/jsx-max-depth': ['error', { max: 12 }],
    'capitalized-comments': 'off',
    'eslint/id-length': 'off',
    'eslint/no-ternary': 'off',
    'eslint/no-void': 'off',
    'eslint/sort-imports': 'off',
    'eslint/sort-keys': 'off',
    'import/consistent-type-specifier-style': [
      'error',
      'prefer-top-level-if-only-type-imports',
    ],
    'import/group-exports': 'off',
    'import/no-default-export': 'off',
    'import/no-named-export': 'off',
    'one-var': 'off',
    'oxc/no-async-await': 'off',
    'oxc/no-optional-chaining': 'off',
    'oxc/no-rest-spread-properties': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/jsx-filename-extension': ['error', { extensions: ['jsx', 'tsx'] }],
    'react/react-in-jsx-scope': 'off',
    'typescript/explicit-function-return-type': 'off',
    'typescript/explicit-module-boundary-types': 'off',
    'typescript/prefer-readonly-parameter-types': 'off',
    'typescript/promise-function-async': 'off',
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      },
    ],
    'vite-plus/prefer-vite-plus-imports': 'error',
    'react-perf/jsx-no-new-object-as-prop': 'off',
    'react-perf/jsx-no-jsx-as-prop': 'off',
    'react-perf/jsx-no-new-function-as-prop': 'off',
    'unicorn/no-null': 'off',
    'eslint/no-undefined': 'off',
    'eslint/no-nested-ternary': 'off',
    'react/todo': 'off',
    'unicorn/explicit-length-check': 'off',
    'no-magic-numbers': 'off',
    'import/prefer-default-export': 'off',
    'eslint/init-declarations': 'off',
    'typescript/strict-boolean-expressions': 'off',
    'eslint/new-cap': 'off',
    'eslint/no-console': 'warn',
    'import/no-named-as-default-member': 'off',
    'unicorn/no-nested-ternary': 'off',
    'typescript/no-confusing-void-expression': 'off',
    'typescript/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
    'typescript/strict-void-return': 'off',
    'react/jsx-no-literals': ['error', { allowedStrings: ['+', '-', ':'] }],
    'unicorn/prefer-ternary': 'off',
    'unicorn/prefer-export-from': 'off',
    'unicorn/prefer-top-level-await': 'off',
    'eslint/no-continue': 'off',
    'eslint/max-params': 'off',
    'react/forbid-component-props': 'off',
    'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
  },
})
