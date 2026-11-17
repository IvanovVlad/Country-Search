import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPrettier from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*"],
    plugins: {},
  },
  eslintPrettier,
  {
    ignores: ["dist"],
  },
]);
