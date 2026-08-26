// ESLint flat config for the Next.js frontend.
//
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import promisePlugin from "eslint-plugin-promise";
import prettierConfig from "eslint-config-prettier";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default tseslint.config()(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "coverage/**",
      "report/**",
      "next-env.d.ts",
    ],
  },

  js.configs.recommended,

  // Type-aware strict + stylistic rules
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Next.js core-web-vitals rules (via legacy-config compat shim)
  ...compat.extends("next/core-web-vitals"),

  security.configs.recommended,
  sonarjs.configs.recommended,

  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      promise: promisePlugin,
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
