import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

const typescriptEslint = await import('typescript-eslint')
  .then((module) => module.default)
  .catch(() => null)

const typescriptConfig = typescriptEslint
  ? typescriptEslint.config(
      {
        files: ['**/*.{ts,tsx}'],
        extends: [
          js.configs.recommended,
          ...typescriptEslint.configs.recommended,
          reactHooks.configs.flat.recommended,
          reactRefresh.configs.vite,
        ],
        languageOptions: {
          globals: globals.browser,
          parserOptions: { ecmaFeatures: { jsx: true } },
        },
      },
    )
  : [{ ignores: ['**/*.{ts,tsx}'] }]

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  ...typescriptConfig,
])
