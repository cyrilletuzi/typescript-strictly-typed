import { findConfig, getConfig, modifyJSON, saveConfig } from './config-utils';

interface TSConfigAngular {
  angularCompilerOptions?: {
    strictInjectionParameters?: boolean;
    strictTemplates?: boolean;
    strictInputAccessModifiers?: boolean;
  };
}

interface TSLintAngular {
  rules?: {
    'template-no-any'?: boolean;
  };
  rulesDirectory?: string | string[];
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

  enableCodelyzerStrict(cwd);

  const file = findConfig(cwd, ['tsconfig.base.json', 'tsconfig.json']);

  if (!file) {
    return false;
  }

  const config = getConfig<TSConfigAngular>(cwd, file);
  if (!config) {
    return false;
  }

  // if (!config.angularCompilerOptions) {
  //   config.angularCompilerOptions = {};
  // }

  modifyJSON(config.raw, ['angularCompilerOptions', 'strictInjectionParameters'], true);
  modifyJSON(config.raw, ['angularCompilerOptions', 'strictTemplates'], true);
  modifyJSON(config.raw, ['angularCompilerOptions', 'strictInputAccessModifiers'], true);

  return saveConfig(cwd, file, config);

}

/**
 * Enable the following Codelizer lint option:
 * - `template-no-any` {@link http://codelyzer.com/rules/template-no-any/}
 * @param cwd Working directory path
 */
function enableCodelyzerStrict(cwd: string): void {

  const file = findConfig(cwd, ['tslint.json', 'tslint.yaml', 'tslint.yml']);

  if (file) {

    const config = getConfig<TSLintAngular>(cwd, file);

    if (config && isCodelyzer(config.json.rulesDirectory)) {

      // if (!config.json.rules) {
      //   config.rules = {};
      // }

      modifyJSON(config.raw, ['rules', 'template-no-any'], true);

      saveConfig(cwd, file, config);

    }

  }

}

/**
 * Check if Codelyzer is enabled
 * @param rulesDirectory TSLint `rulesDirectory`
 */
function isCodelyzer(rulesDirectory?: string | string[]): boolean {

  if (typeof rulesDirectory === 'string') {
    return rulesDirectory.includes('codelyzer');
  } else if (Array.isArray(rulesDirectory)) {
    for (const ruleDirectory of rulesDirectory) {
      if (ruleDirectory.includes('codelyzer')) {
        return true;
      }
    }
  }

  return false;

}
