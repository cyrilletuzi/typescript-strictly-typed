// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      // Enforce modern JavaScript
      "prefer-template": "error",
      "prefer-arrow-callback": "error",
      // Stricter JavaScript
      "no-new-native-nonconstructor": "error",
      "no-constant-binary-expression": "error",
      "prefer-object-has-own": "error", // ES2022+
      // Strict types
      "eqeqeq": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/restrict-plus-operands": [
        "error",
        {
          "allowAny": false,
          "allowBoolean": false,
          "allowNullish": false,
          "allowNumberAndString": false,
          "allowRegExp": false
        }
      ],
      "@typescript-eslint/restrict-template-expressions": "error",
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          "allowNumber": false,
          "allowString": false
        }
      ],
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/no-useless-empty-export": "error",
      "@typescript-eslint/no-useless-default-assignment": "error",
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
      ]
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  });