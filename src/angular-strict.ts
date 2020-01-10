import { findConfig, getConfig, saveConfig } from './config-utils';
import { TSConfig } from './typescript-strict';

interface TSConfigAngular extends TSConfig {
  angularCompilerOptions?: {
    fullTemplateTypeCheck?: boolean;
    strictInjectionParameters?: boolean;
    strictTemplates?: boolean;
  };
}

/**
 * Enable the following Angular compiler options:
 * - `fullTemplateTypeCheck`
 * - `strictInjectionParameters`
 * - `strictTemplates` (Angular >=9)
 * {@link https://angular.io/guide/angular-compiler-options}
 *
 * @param options Object of options:
 * - `strictPropertyInitialization`: Strict property initialization check is an issue in Angular projects,
 * as most properties are initiliazed in `ngOnInit()` instead of `constructor()`
 * or via decorators (mainly via `@Input()`). So we disable it by default, as recommanded by Angular team.
 * Set this option to `true` to manually enable it.
 *
 * @returns A boolean for success or failure
 */
export default function enableAngularStrict({ strictPropertyInitialization = false } = {}): boolean {

  const file = findConfig(['tsconfig.json']);

  if (!file) {
    return false;
  }

  const config = getConfig<TSConfigAngular>(file);
  if (!config) {
    return false;
  }

  if (!config.compilerOptions) {
    config.compilerOptions = {};
  }

  if (strictPropertyInitialization !== true) {
    config.compilerOptions.strictPropertyInitialization = false;
  }

  if (!config.angularCompilerOptions) {
    config.angularCompilerOptions = {};
  }

  config.angularCompilerOptions.fullTemplateTypeCheck = true;
  config.angularCompilerOptions.strictInjectionParameters = true;
  config.angularCompilerOptions.strictTemplates = true;

  return saveConfig(file, config);

}
