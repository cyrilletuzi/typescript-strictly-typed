# TypeScript Strictly Typed

Enable configurations for strictly typed TypeScript, ESLint or TSLint, and optionally Angular.
Because TypeScript `strict` mode is not enough.

A [blog post](https://medium.com/@cyrilletuzi/typescript-strictly-typed-strict-mode-is-not-enough-40df698e2deb?source=friends_link&sk=00f968af095e7615f7220314df280a1b)
explains the motivation of this lib.

## Getting started

```bash
cd path/to/my-project
npx typescript-strictly-typed
```

## What does it do?

Adding configuration for:

- [TypeScript compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
  - `strict`
- [ESLint rules](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin)
  - `@typescript-eslint/no-explicit-any`
  - `@typescript-eslint/explicit-function-return-type`
- [TSLint rules](https://palantir.github.io/tslint/rules/)
  - `no-any`
  - `typedef` with `call-signature`
- [Angular compiler options](https://angular.io/guide/angular-compiler-options)
  - `fullTemplateTypeCheck`
  - `strictInjectionParameters`
  - `strictTemplates` (Angular >=9)

## By the same author

- [Angular schematics extension for VS Code](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics) (GUI for Angular CLI commands)
- [@ngx-pwa/local-storage](https://github.com/cyrilletuzi/angular-async-local-storage): 1st Angular library for local storage
- Popular [Angular posts on Medium](https://medium.com/@cyrilletuzi)
- Follow updates of this lib on [Twitter](https://twitter.com/cyrilletuzi)
- **[Angular onsite trainings](https://formationjavascript.com/formation-angular/)** (based in Paris, so the website is in French, but [my English bio is here](https://www.cyrilletuzi.com/en/) and I'm open to travel)

My open source contributions are done on free time.
So if your company earns money with them,
it would be nice to **consider becoming [a sponsor](https://github.com/sponsors/cyrilletuzi)**.

## Requirements

### Node & npm

You need a LTS version of Node and npm, ie. currently:
- Node >= 10.13
- npm >= 6.4

### Directory

Be sure to invoke the command in the *root* directory of your project,
ie. where your configuration files (like `tsconfig.json`) are located.

### TypeScript

`strict` mode is available in TypeScript >= 2.3.

### ESLint

ESLint must be configured for TypeScript, ie. with:
- `"parser": "@typescript-eslint/parser"` and `"plugins": ["@typescript-eslint"]`
- or an equivalent (for example Vue uses `"extends": ["@vue/typescript"]` and React uses `"extends": "react-app"`)

[Official getting started documentation of `@typescript-eslint`](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md)

### Angular

The project must use a LTS version of Angular CLI, ie. with a `angular.json` file.

## Advanced options

### Angular

TypeScript `strict` mode includes the `strictPropertyInitialization` rule.
But property initialization check is an issue in Angular projects,
as most properties are initiliazed in `ngOnInit()` instead of `constructor()`
or via decorators (mainly via `@Input()`).

So this lib disables `strictPropertyInitialization` by default in Angular projects,
as recommended by the Angular team.

If you're feeling adventurous and want to enable it:
```bash
npx typescript-strictly-typed --strictPropertyInitialization
```

## Known limitations

This lib is here to promote good practices. But at the end of the day,
it just adds a few lines in configuration files, as explained above in "What does it do?".

It was already a lot of work to support all possible official configuration formats.
So if it doesn't work for your project because of a custom configuration,
you can just modify the configuration files yourself.

### React apps

For React apps created with `create-react-app`, after running this lib command,
it will work out of the box:
- in your editor (for example if you have the ESLint extension in Visual Studio Code)
- if you run lint manually (for example with `eslint src/**` command)

But it won't be taken into account at React compilation (ie. on `npm start`),
because React does custom things.

See [issue #2](https://github.com/cyrilletuzi/typescript-strictly-typed/issues/2)
if you want to help.

### Apps using `.eslintrc.js` (including Vue)

If your project uses a `.eslintrc`*`.js`* file (instead of a more classic `.eslintrc`*`.json`* file)
you'll have to copy the strict rules newly generated in `.eslintrc`*`.json`* file
into the existing `.eslintrc`*`.js`* file.

For Vue apps created with `vue create`, after running this lib command,
it will work out of the box if you chose one of the following Vue options:
- ESLint with config stored **in package.json**
- TSLint

But if you chose ESLint with *a dedicated config file*,
Vue will create a `.eslintrc`*`.js`* file and so you'll have to do the above step.

See [issue #3](https://github.com/cyrilletuzi/typescript-strictly-typed/issues/3)
if you want to help.

## License

MIT
