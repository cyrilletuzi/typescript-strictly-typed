# Changelog

## 3.10.0 (2023-05-29)

New lint rules:
- `@typescript-eslint/strict-boolean-expressions`
- `@typescript-eslint/restrict-template-expressions`
- `prefer-arrow-callback`
- `prefer-for-of`

## 3.6.0 (2023-05-17)

- Partial support for ESLint 9 new flat config

## 3.4.0 (2023-05-16)

New lint rules:
- `prefer-template`
- `@typescript-eslint/explicit-function-return-type` (replaces `@typescript-eslint/explicit-module-boundary-types`)
- `@typescript-eslint/prefer-nullish-coalescing`
- `@typescript-eslint/use-unknown-in-catch-callback-variable`
- `@typescript-eslint/no-non-null-assertion`
- `@typescript-eslint/restrict-plus-operands`

## 3.3.0 (2023-05-24)

- New ESLint rule: `eqeqeq`

## 3.2.0 (2023-04-14)

- Check Git status is clean before doing anything

## 3.1.0 (2023-03-17)

- Now checking if `@typescript-eslint/eslint-plugin` is installed, instead of specific frameworks configurations that changes every two minutes.
- Support `.eslintrc.cjs`.

## 3.0.6 (2023-03-17)

- Requires Node >= 16
- Only add `forceConsistentCasingInFileNames` in TypeScript <= 4.9, as it is now true by default in TypeScript >= 5.0.
- Add back `exactOptionalPropertyTypes`. It is reliable for your own code. Issues are only because of some libraries, so if a library is not correct regarding this check, report it to the lib repo, and temporarily add `skipLibCheck` to your `tsconfig.json`.
- Add back `noUncheckedIndexedAccess` if TypeScript >= 5.0. It was reverted because the compiler is not smart enough in some cases. First case was dynamic objects (`Record` or `{ [key: string]: string }`): but now TypeScript >= 5.0 infers correctly if you check before (`if ('someProperty' in someObject)`). Second case is still there and is when accessing directly a speficic array value (`myArray[2]`) but those cases mainly happen because of old JavaScript syntaxes, there are easily avoided with modern syntaxes (like `for...of`, `?.`, `??`).

## 2.13.0 (2022-04-11)

Remove support for TSLint and Codelyzer.

## 2.12.2 (2021-11-24)

Fix a dependency issue.

## 2.12.1 (2021-11-19)

Just a documentation update.

## 2.12.0 (2021-11-04)

### Feature

Disable the addition of `exactOptionalPropertyTypes` for now, as too much libraries are not supporting it yet.

## 2.11.0 (2021-08-27)

### Feature

Add a new `tsconfig.json` rule in projects with TypeScript >= 4.4:
- `exactOptionalPropertyTypes`

## 2.10.0 (2021-08-23)

### Feature

Preserve comments in JSON files.

## 2.9.0 (2021-06-04)

### Feature

Add a new `tsconfig.json` rule in projects with TypeScript >= 4.3:
- `noImplicitOverride`

Reminder: a Node LTS version is required, so Node 10 may still work but is no longer supported.

## 2.8.0 (2021-04-19)

### Features

For ESLint:
- add `@typescript-eslint/explicit-module-boundary-types` instead of `@typescript-eslint/explicit-function-return-type`
- preserve advanced options if rules already exist
- do not add TypeScript rules twice if already done in an `override`

## 2.7.0 (2021-02-24)

### Feature

Add `tsconfig.json` rule:
- `noPropertyAccessFromIndexSignature` (TypeScript >= 4.2)

## 2.6.0 (2021-01-21)

Reverting the addition of `noUncheckedIndexedAccess` flag.
Currently it reports too much false positives,
which probably explains why it is not part of the `strict` mode.

## 2.5.0 (2021-01-03)

### Feature

Add `@angular-eslint/template/no-any` rule in relevant projects.

## 2.4.0 (2020-11-20)

### Features

Add `tsconfig.json` rules:
- `forceConsistentCasingInFileNames`
- `noFallthroughCasesInSwitch`
- `noImplicitReturns`

## 2.3.1 (2020-11-16)

### Bug fixes

- Override ESLint rules if already here but disabled
- Always add ESLint rules at root level even when there are overrides

## 2.3.0 (2020-11-16)

### Feature

Support adding ESLint strict rules in `overrides`, which means support for `@angular-eslint`!

## 2.2.0 (2020-11-10)

### Feature

For Angular projects still using TSLint/Codelyzer, add the following lint option:
- [`template-no-any`](http://codelyzer.com/rules/template-no-any/)

## 2.1.2 (2020-10-07)

No change.

New release for internal purposes.

## 2.1.1 (2020-10-07)

No change, new release for internal purposes.

## 2.1.0 (2020-10-02)

### Feature

- For Angular projects, update to last Angular strict compiler options:
  - `fullTemplateTypeCheck` is not required anymore as it is replaced by `strictTemplates`
  - add new `strictInputAccessModifiers` option

## 2.0.0 (2020-05-24)

### Features

- Look for `tsconfig.base.json` to support new "solution style" configuration introduced in
[TypeScript 3.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html#support-for-solution-style-tsconfigjson-files) and already used by Angular 10.

- Enable full strict mode for Angular projects, to align with new Angular 10 recommandations
(previously `strictPropertyInitialization` was disabled).

## 1.1.1 (2020-03-13)

No code change, just rebuild with latest `minimist` dependency to fix security audits.

## 1.1.0 (2020-01-30)

### Feature

Clean up `tsconfig.json` options already included in `strict` mode.

## 1.0.0 (2020-01-13)

Initial release.
