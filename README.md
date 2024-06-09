# TypeScript Strictly Typed

Configure TypeScript, ESLint or Biome, and optionally Angular to ensure fully typed code. Because `strict` mode is not enough.

A [blog post](https://medium.com/@cyrilletuzi/typescript-strictly-typed-strict-mode-is-not-enough-40df698e2deb?source=friends_link&sk=00f968af095e7615f7220314df280a1b) explains the motivation of this lib.

> [!TIP]
> I am also the author of the [Angular Schematics extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics), installed 1 million times. Feel free to give it a try.

## Getting started

Just run the following commands in your terminal:

```bash
cd path/to/my-project-with-tsconfig
npx typescript-strictly-typed@latest
```

> [!IMPORTANT]
> Going fully typed is a choice to make at the *very beginning* of a project.
>
> **Enabling all strict options at once in an existing project is not recommended**, as hundred of errors would appear. Converting an existing project to full strict mode is still possible and encouraged, but it should be done *incrementally*, by activating each option *one by one*.

## What does it do?

It modifies these configurations:

- [TypeScript compiler options](https://www.typescriptlang.org/tsconfig)
  - `strict` (includes: `noImplicitAny`, `strictNullChecks`, `alwaysStrict`, `strictBindCallApply`, `strictFunctionTypes`, `strictPropertyInitialization`, `noImplicitThis`, `useUnknownInCatchVariables`)
  - `exactOptionalPropertyTypes`
  - `noFallthroughCasesInSwitch`
  - `noImplicitOverride`
  - `noImplicitReturns`
  - `noPropertyAccessFromIndexSignature`
  - `noUncheckedIndexedAccess`
- [ESLint rules](https://eslint.org/docs/latest/rules/)
  - `eqeqeq`
  - `prefer-arrow-callback`
  - `prefer-template`
- [TypeScript ESLint rules](https://typescript-eslint.io/rules/)
  - `@typescript-eslint/explicit-function-return-type`
  - `@typescript-eslint/no-explicit-any`
  - `@typescript-eslint/no-non-null-assertion`
  - `@typescript-eslint/no-unsafe-argument`
  - `@typescript-eslint/no-unsafe-assignment`
  - `@typescript-eslint/no-unsafe-call`
  - `@typescript-eslint/no-unsafe-member-access`
  - `@typescript-eslint/no-unsafe-return`
  - `@typescript-eslint/prefer-for-of`
  - `@typescript-eslint/prefer-nullish-coalescing`
  - `@typescript-eslint/prefer-optional-chain`
  - `@typescript-eslint/restrict-plus-operands`
  - `@typescript-eslint/restrict-template-expressions`
  - `@typescript-eslint/strict-boolean-expressions`
  - `@typescript-eslint/use-unknown-in-catch-callback-variable`
- [Biome linter rules](https://biomejs.dev/linter/rules/)
  - `noDoubleEquals`
  - `noExplicitAny`
  - `noImplicitAnyLet`
  - `noNonNullAssertion`
  - `useArrowFunction`
  - `useForOf`
  - `useOptionalChain`
  - `useTemplate`
- [Angular compiler options](https://angular.dev/reference/configs/angular-compiler-options)
  - `strictInjectionParameters`
  - `strictInputAccessModifiers`
  - `strictTemplates`
- [Angular ESLint options](https://github.com/angular-eslint/angular-eslint)
  - `@angular-eslint/template/no-any`

> [!IMPORTANT]
> Some TypeScript ESLint rules require type checking. Please follow the [official documentation](https://typescript-eslint.io/getting-started/typed-linting) to enable that in your project.

> [!IMPORTANT]
> ESLint configuration files in JavaScript format (`eslint.config.js` and `.eslintrc.js`) are a nightmare for tools authors, because it is far more difficult to manipulate a JavaScript file than a JSON file. For now, in such cases, the command will generate a JSON file. Then, it is up to you to copy the rules from the generated JSON file to your existing JavaScript file. The generated JSON file can then be deleted.

> [!NOTE]
> To keep configuration concise, you may not see all TypeScript and Biome options added, if they are already enabled by an existing preset. All ESLint rules will be added, as ESLint configuration is too complex to detect presets.

## License

MIT
