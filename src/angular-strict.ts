import { findConfig, getConfig, saveConfig } from './config-utils';

interface TSConfigAngular {
  angularCompilerOptions?: {
    strictInjectionParameters?: boolean;
    strictTemplates?: boolean;
    strictInputAccessModifiers?: boolean;
  };
}

/**
 * Enable the following Angular compiler options:
 * - `strictInjectionParameters`
 * - `strictTemplates`
 * - `strictInputAccessModifiers`
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

  config.angularCompilerOptions.strictInjectionParameters = true;
  config.angularCompilerOptions.strictTemplates = true;
  config.angularCompilerOptions.strictInputAccessModifiers = true;

  return saveConfig(cwd, file, config);

}
