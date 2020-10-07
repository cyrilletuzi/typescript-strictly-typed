# Changelog

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
