# TypeScript Strictly Typed

Enable configurations for strictly typed TypeScript, ESLint, and optionally Angular.
Because TypeScript `strict` mode is not enough.

A [blog post](https://medium.com/@cyrilletuzi/typescript-strictly-typed-strict-mode-is-not-enough-40df698e2deb?source=friends_link&sk=00f968af095e7615f7220314df280a1b)
explains the motivation of this lib.

## Status of this lib

Given my current professional situation and the lack of support for my open source work, this tool is just provided as is.

## How to help?

My open source work represents *months* of full time *unpaid* work, with for example the [Angular schematics extension for VS Code](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics),
**used by 600 000 developers**.

So if you want to help, I released **[Schematics Pro](https://www.cyrilletuzi.com/schematics-pro/)**, a paid code automation tool for Angular, React, Vue, Ionic, Svelte, Stencil, Lit, Nest and more.

## Warning

Going fully strict is a choice to make at the *very beginning* of a project.

**Enabling all strict options at once in an existing project is strongly discouraged**,
as hundred of errors would appear. Converting an existing project to full strict mode is still possible,
but it should be done *incrementally*, by activating each option *one by one*.

On the other hand, it's recommended to redo the command when doing major updates of your tools
(TypeScript, ESLint or Angular) to add newly introduced strict options,
to stay up to date with best practices.

## Getting started

Check the Git (or equivalent) status is clean, to be able to revert easily if needed,
then just run the following commands in your terminal:

```bash
cd path/to/my-project-with-tsconfig
npx typescript-strictly-typed@latest
```

## What does it do?

Adding configuration for:

- [TypeScript compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
  - `strict` (which includes in particular `noImplicitAny` and `strictNullChecks`)
  - `noFallthroughCasesInSwitch`
  - `noImplicitReturns`
  - `noPropertyAccessFromIndexSignature`
  - `noImplicitOverride`
  - `exactOptionalPropertyTypes`
  - `noUncheckedIndexedAccess`
- [ESLint rules](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin)
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
