import { findConfig, getConfig, saveConfig } from './config-utils';
import { TSConfig } from './typescript-strict';

interface TSConfigAngular extends TSConfig {
  angularCompilerOptions?: {
    fullTemplateTypeCheck?: boolean;
    strictInjectionParameters?: boolean;
    strictTemplates?: boolean;
  };
}

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

  /* Strict property initialization check is an issue in Angular projects,
   * as most properties are initiliazed in `ngOnInit()` instead of `constructor()`
   * or via decorators (mainly via `@Input()`).
   * So we disable it, except if requested.
   */
  if (strictPropertyInitialization !== true) {
    config.compilerOptions.strictPropertyInitialization = false;
  }

  if (!config.angularCompilerOptions) {
    config.angularCompilerOptions = {};
  }

  /* Available in Angular >= 5 */
  config.angularCompilerOptions.fullTemplateTypeCheck = true;
  /* Available in Angular >= 5 */
  config.angularCompilerOptions.strictInjectionParameters = true;
  /* Available in Angular >= 9 */
  config.angularCompilerOptions.strictTemplates = true;

  return saveConfig(file, config);

}
