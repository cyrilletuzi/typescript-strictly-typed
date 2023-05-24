# TypeScript Strictly Typed

Configure TypeScript, ESLint, and optionally Angular to ensure fully typed code. Because `strict` mode is not enough.

A [blog post](https://medium.com/@cyrilletuzi/typescript-strictly-typed-strict-mode-is-not-enough-40df698e2deb?source=friends_link&sk=00f968af095e7615f7220314df280a1b) explains the motivation of this lib.

## How to help?

This lib and my other tools represent *months* of full time *unpaid* work, with for example the [Angular schematics extension for VS Code](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics), **installed 800 000 times**.

So if you want to help, I released **[Schematics Pro](https://www.cyrilletuzi.com/schematics-pro/)**, a paid code automation tool for Angular, React, Vue, Ionic, Svelte, Stencil, Lit, Nest and more.

Or you can [sponsor my GitHub account](https://github.com/sponsors/cyrilletuzi).

Thank you! ♥️

## Warning

Going fully typed is a choice to make at the *very beginning* of a project.

**Enabling all strict options at once in an existing project is strongly discouraged**, as hundred of errors would appear. Converting an existing project to full strict mode is still possible end encouraged, but it should be done *incrementally*, by activating each option *one by one*.

## Getting started

Just run the following commands in your terminal:

```bash
cd path/to/my-project-with-tsconfig
npx typescript-strictly-typed@latest
```

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
- [TypeScript ESLint rules](https://typescript-eslint.io/rules/)
  - `@typescript-eslint/no-explicit-any`
  - `@typescript-eslint/explicit-module-boundary-types`
- [Angular compiler options](https://angular.io/guide/angular-compiler-options)
  - `strictInjectionParameters`
  - `strictTemplates`
  - `strictInputAccessModifiers`
- [Angular ESLint options](https://github.com/angular-eslint/angular-eslint)
  - `@angular-eslint/template/no-any`

## License

MIT
