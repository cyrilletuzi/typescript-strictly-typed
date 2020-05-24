import { findConfig, getConfig, saveConfig } from './config-utils';

interface TSConfigAngular {
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
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 */
export default function enableAngularStrict(cwd: string): boolean {

  const file = findConfig(cwd, ['tsconfig.base.json', 'tsconfig.json']);

  if (!file) {
    return false;
  }

  const config = getConfig<TSConfigAngular>(cwd, file);
  if (!config) {
    return false;
  }

  if (!config.angularCompilerOptions) {
    config.angularCompilerOptions = {};
  }

  config.angularCompilerOptions.fullTemplateTypeCheck = true;
  config.angularCompilerOptions.strictInjectionParameters = true;
  config.angularCompilerOptions.strictTemplates = true;

  return saveConfig(cwd, file, config);

}
