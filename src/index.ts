import { findConfig } from './config-utils';
import enableTypescriptStrict from './typescript-strict';
import enableESLintStrict from './eslint-strict';
import enableTSLintStrict from './tslint-strict';
import enableAngularStrict from './angular-strict';

interface TypescriptStrictlyStrictOptions {
  strictPropertyInitialization?: boolean;
}

/**
 * Enable strict configurations for:
 * - TypeScript compiler
 * - ESLint or TSLint rules
 * - Angular compiler (if `angular.json` is detected)
 *
 * @param options Object of options:
 * - `strictPropertyInitialization`: Strict property initialization check is an issue in Angular projects,
 * as most properties are initiliazed in `ngOnInit()` instead of `constructor()`
 * or via decorators (mainly via `@Input()`). So we disable it by default in Angular projects, as recommanded by Angular team.
 * Set this option to `true` to manually enable it.
 */
export default function typescriptStrictlyStrict({ strictPropertyInitialization }: TypescriptStrictlyStrictOptions = {}): void {

  const success: string[] = [];

  if (enableTypescriptStrict()) {
    success.push('TypeScript');
  }

  if (enableESLintStrict()) {
    console.log(`Skipping TSLint configuration as ESLint has been found and configured.`)
    success.push('ESLint');
  } else if (enableTSLintStrict()) {
    success.push('TSLint');
  }

  if (findConfig(['angular.json', '.angular.json', 'angular-cli.json', '.angular-cli.json']) && enableAngularStrict({ strictPropertyInitialization })) {
    success.push('Angular');
  }

  console.log(`Configuration finished. It succeeded for: ${success.join(', ')}.`);

}
