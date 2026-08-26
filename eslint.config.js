// ESLint flat config for the Next.js frontend.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import promisePlugin from "eslint-plugin-promise";
import prettierConfig from "eslint-config-prettier";
import nextPlugin from "@next/eslint-plugin-next";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "coverage/**",
      "report/**",
      "next-env.d.ts",
      "**/*.d.ts",
      "*.config.js",
      "*.config.mjs",
      "*.config.cjs",
      "types/validator.ts"
    ],
  },

  js.configs.recommended,

  // Type-aware strict + stylistic rules
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Native Next.js recommended & Core Web Vitals rules for ESLint 9
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  security.configs.recommended,
  sonarjs.configs.recommended,

  {
    plugins: {
      promise: promisePlugin,
    },
    languageOptions: {
      parserOptions: {
        // --- THIS IS THE FIX ---
        projectService: {
          allowDefaultProject: ["types/*.ts", "*.js", "*.mjs"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // --- Complexity limits ---
      complexity: ["error", 10],
      "max-depth": ["error", 3],
      "max-nested-callbacks": ["error", 3],
      "max-lines-per-function": [
        "error",
        { max: 60, skipBlankLines: true, skipComments: true },
      ],
      "sonarjs/cognitive-complexity": ["error", 15],

      // --- Unsafe `any` usage ---
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",

      // --- Unhandled promises ---
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "promise/always-return": "error",
      "promise/no-nesting": "warn",
      "promise/catch-or-return": "error",

      // --- Security ---
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-eval-with-expression": "error",
    },
  },

  // Let Prettier own formatting; disable stylistic conflicts.
  prettierConfig,
);