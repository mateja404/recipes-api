import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      // Nema potrebe za dodavanjem js kao plugin
    },
    extends: [
      // Uključuje sve osnovne preporučene JS pravila
      "eslint:recommended",
      // Dodaj TypeScript preporučena pravila
      "plugin:@typescript-eslint/recommended",
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
  {
    files: ["**/*.{ts,mts,cts}"],
    extends: [
      // Preporučena konfiguracija za TypeScript
      tseslint.configs['recommended'],
    ],
  },
]);
