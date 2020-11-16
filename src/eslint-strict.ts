import { findConfig, getConfig, saveConfig } from './config-utils';
import { logWarning } from './log-utils';

interface ESLint {
  rules?: {
    '@typescript-eslint/no-explicit-any'?: string | string[];
    '@typescript-eslint/explicit-function-return-type'?: string | string[];
  };
  plugins?: string[];
  extends?: string | string[];
  overrides?: {
    extends?: string | string[];
  }[];
}

interface PackageJSON {
  eslintConfig?: ESLint;
}

/**
 * Enable the following ESLint rules:
 * - `@typescript-eslint/no-explicit-any`
 * - `@typescript-eslint/explicit-function-return-type`
 * {@link https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin}
 *
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 */
export default function enableESLintStrict(cwd: string): boolean {

  const possibleConfigFiles = ['.eslintrc.json', '.eslintrc.yaml', '.eslintrc.yml', '.eslintrc.js', 'package.json'];

  let config: ESLint | null = null;
  let packageJSONConfig: PackageJSON | null = null;

  const file = findConfig(cwd, possibleConfigFiles);
  if (!file) {
    return false;
  }

  if (file === 'package.json') {
    packageJSONConfig = getConfig<PackageJSON>(cwd, file);
    if (!packageJSONConfig) {
      return false;
    }
    config = packageJSONConfig.eslintConfig ?? null;
  } else {
    config = getConfig<ESLint>(cwd, file);
  }

  if (!config) {
    return false;
  }

  checkConfig(config);

  if (!config.rules) {
    config.rules = {};
  }

  if (!config.rules['@typescript-eslint/no-explicit-any']) {
    config.rules['@typescript-eslint/no-explicit-any'] = 'error';
  }

  if (!config.rules['@typescript-eslint/explicit-function-return-type']) {
    config.rules['@typescript-eslint/explicit-function-return-type'] = 'error';
  }

  if (packageJSONConfig) {
    packageJSONConfig.eslintConfig = config;
    return saveConfig(cwd, file, packageJSONConfig);
  } else if (file === '.eslintrc.js') {
    logWarning(`Your project is using the advanced .eslintrc.js format for ESLint config, and it can't be overwrited directly, as it could mess up with advanced configuration. So the new strict configuration was saved in .eslintrc.json. As .eslintrc.js has precedence over .eslintrc.json, you need to manually copy the new options from the new .eslintrc.json to your preexisting .eslintrc.js. If you know a way to automate this, please open a PR.`);
    return saveConfig(cwd, '.eslintrc.json', config);
  } else {
    return saveConfig(cwd, file, config);
  }

}

function checkConfig(config: ESLint): void {

  const eslintTypeScriptPlugin = '@typescript-eslint' as const;
  const eslintReactPlugin = 'react-app' as const;
  const eslintVuePlugin = '@vue/typescript' as const;
  const eslintAngularPlugin = '@angular-eslint' as const;
  const eslintExtensionPlugins = [eslintReactPlugin, eslintVuePlugin, eslintAngularPlugin] as const;

  /* Case: @typescript-eslint */
  if (config.plugins?.includes(eslintTypeScriptPlugin)) return;

  /* Case: extensions */
  for (const extension of eslintExtensionPlugins) {

    /* Case: plugin in `extends` */
    if (Array.isArray(config.extends)) {
      for (const extend of config.extends) {
        if (extend.includes(extension)) return;
      }
    }

    if (config.extends?.includes(extension)) return;

    /* Case: plugin in `overrides[x].extends` */
    if (Array.isArray(config.overrides)) {
      for (const override of config.overrides) {

        if (Array.isArray(override.extends)) {
          for (const extend of override.extends) {
            if (extend.includes(extension)) return;
          }
        }

        if (override.extends?.includes(extension)) return;

      }
    }

  }

  logWarning(`ESLint must be configured with "${eslintTypeScriptPlugin}" plugin or with a tool extending it like "${eslintVuePlugin}", "${eslintReactPlugin}" or "${eslintAngularPlugin}", otherwise rules won't be checked.`);

}
