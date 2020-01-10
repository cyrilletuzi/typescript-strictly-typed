import { findConfig } from './config-utils';
import enableTypescriptStrict from './typescript-strict';
import enableESLintStrict from './eslint-strict';
import enableTSLintStrict from './tslint-strict';
import enableAngularStrict from './angular-strict';

interface TypescriptStrictlyTypedOptions {
  strictPropertyInitialization?: boolean;
}

/**
 * Enable strictly typed configurations for:
 * - TypeScript compiler
 * - ESLint or TSLint rules
 * - Angular compiler (if `angular.json` is detected)
 *
 * @param cwd Working directory path
 * @param options Object of options:
 * - `strictPropertyInitialization`: Strict property initialization check is an issue in Angular projects,
 * as most properties are initiliazed in `ngOnInit()` instead of `constructor()`
 * or via decorators (mainly via `@Input()`). So it's disabled by default in Angular projects, as recommanded by Angular team.
 * Set this option to `true` to manually enable it.
 */
export default function typescriptStrictlyTyped(cwd: string, { strictPropertyInitialization }: TypescriptStrictlyTypedOptions = {}): void {

  const success: string[] = [];

  if (enableTypescriptStrict(cwd)) {
    success.push('TypeScript');
  }

  if (enableESLintStrict(cwd)) {
    console.log(`Skipping TSLint configuration as ESLint has been found and configured.`)
    success.push('ESLint');
  } else if (enableTSLintStrict(cwd)) {
    success.push('TSLint');
  }

  if (findConfig(cwd, ['angular.json', '.angular.json', 'angular-cli.json', '.angular-cli.json'])
     && enableAngularStrict(cwd, { strictPropertyInitialization })) {
    success.push('Angular');
  }

  console.log(`Configuration finished. It succeeded for: ${success.join(', ')}.`);

}
