# TypeScript Strictly Typed

Configure TypeScript, ESLint, and optionally Angular to ensure fully typed code. Because `strict` mode is not enough.

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

> [!NOTE]
> ESLint 9 new flat config is now using a JavaScript file instead of a JSON file. It is a terrible choice for tools like this one, because while JSON manipulation is tedious but manageable, parsing a JavaScript file is far more complex. Even worse: it allows different implementations, which is what TypeScript-ESLint is doing. So as long as a helper is not provided to modify the configuration, I will not add support for ESLint 9. Just add the below configuration manually in `eslint.config.js`.

## What does it do?

It modifies these configurations:

- [TypeScript compiler options](https://www.typescriptlang.org/tsconfig)
  - `strict` (includes: `noImplicitAny`, `strictNullChecks`, `alwaysStrict`, `strictBindCallApply`, `strictFunctionTypes`, `strictPropertyInitialization`, `noImplicitThis`, `useUnknownInCatchVariables`)
  - `noFallthroughCasesInSwitch`
  - `noImplicitReturns`
  - `noPropertyAccessFromIndexSignature`
  - `noImplicitOverride`
  - `exactOptionalPropertyTypes`
  - `noUncheckedIndexedAccess`
- [ESLint rules](https://eslint.org/docs/latest/rules/)
  - `eqeqeq`
  - `prefer-template`
- [TypeScript ESLint rules](https://typescript-eslint.io/rules/)
  - `@typescript-eslint/no-explicit-any`
  - `@typescript-eslint/explicit-function-return-type`
  - `@typescript-eslint/prefer-nullish-coalescing`
  - `@typescript-eslint/use-unknown-in-catch-callback-variable`
  - `@typescript-eslint/no-non-null-assertion`
  - `@typescript-eslint/restrict-plus-operands`
- [Angular compiler options](https://angular.dev/reference/configs/angular-compiler-options)
  - `strictInjectionParameters`
  - `strictTemplates`
  - `strictInputAccessModifiers`
- [Angular ESLint options](https://github.com/angular-eslint/angular-eslint)
  - `@angular-eslint/template/no-any`

## License

MIT
