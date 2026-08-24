import js from '@eslint/js'
import tseslint from 'typescript-eslint'

/**
 * Strict on correctness, silent on taste — per conventions.md -> Tooling.
 * Formatting is Prettier's job and never fails the gate.
 */
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'pm_skills/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      // Taste rules stay off: a noisy rule that gets inline-disabled erodes
      // trust in the whole gate.
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // Node tooling scripts: not part of the app bundle, not type-checked
    // against the app's tsconfig, and they legitimately use Node globals.
    files: ['**/*.mjs', 'scripts/**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly', URL: 'readonly' },
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
)
