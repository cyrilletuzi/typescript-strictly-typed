// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      // Enforce modern JavaScript
      "prefer-object-has-own": "error", // ES2022+
      "prefer-object-spread": "error",
      "object-shorthand": "error",
      // Security
      "no-eval": "error",
      "no-script-url": "error",
      "no-extend-native": "error",
      // Performance
      "no-await-in-loop": "error",
      // Disallow confusing syntaxes
      "no-new-native-nonconstructor": "error",
      "no-constant-binary-expression": "error",
      "no-bitwise": "error",
      "no-caller": "error",
      "array-callback-return": "error",
      "no-new-wrappers": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      "no-unmodified-loop-condition": "error",
      "curly": "error",
      "no-alert": "error",
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": "error",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
      "no-invalid-this": "off",
      "@typescript-eslint/no-invalid-this": "error",
      // Strict types
      "eqeqeq": "error",
      "prefer-template": "error",
      "prefer-arrow-callback": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/restrict-plus-operands": ["error", {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        }],
      "@typescript-eslint/restrict-template-expressions": ["error", {
          allow: [],
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumber: false,
          allowRegExp: false,
        }],
      "@typescript-eslint/strict-boolean-expressions": ["error", {
          allowNumber: false,
          allowString: false,
        }],
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/no-useless-empty-export": "error",
      "@typescript-eslint/no-useless-default-assignment": "error",
      "@typescript-eslint/strict-void-return": "error",
      // Loosen some annoying and inadequate empty rules
      "no-empty": [
        "error",
        {
          allowEmptyCatch: true, // `catch` is required after a `try`, but there is not always something to do inside
        },
      ],
      "@typescript-eslint/no-empty-function": [
        "error",
        {
          allow: ["arrowFunctions"], // some callbacks are required (like in promises `.catch()`), but there is not always something to do inside
        },
      ],
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          allowInterfaces: "with-single-extends",
        },
      ],
      // Force usage of "node:" protocol for Node builtins
      "no-restricted-imports": [
        "error",
        "assert",
        "buffer",
        "child_process",
        "cluster",
        "crypto",
        "dgram",
        "dns",
        "domain",
        "events",
        "freelist",
        "fs",
        "http",
        "https",
        "module",
        "net",
        "os",
        "path",
        "punycode",
        "querystring",
        "readline",
        "repl",
        "smalloc",
        "stream",
        "string_decoder",
        "sys",
        "timers",
        "tls",
        "tracing",
        "tty",
        "url",
        "util",
        "vm",
        "zlib"
      ],
      "no-var": "error",
      "prefer-rest-params": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/method-signature-style": "error",
      "@typescript-eslint/no-array-constructor": "error",
      "@typescript-eslint/no-base-to-string": "error",
      "@typescript-eslint/no-implied-eval": "error",
      "@typescript-eslint/no-invalid-void-type": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-declaration-merging": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-unary-minus": "error",
      "@typescript-eslint/require-array-sort-compare": "error",
      "@typescript-eslint/unbound-method": "error"
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  });