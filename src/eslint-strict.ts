import { findConfig, getConfig, saveConfig } from './config-utils';

interface ESLint {
  rules?: {
    '@typescript-eslint/no-explicit-any'?: string | string[];
    '@typescript-eslint/explicit-function-return-type'?: string | string[];
  };
  parser?: string;
  plugins?: string[];
  extends?: string[];
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
  const eslintTypeScriptPlugin = '@typescript-eslint';
  const eslintVuePlugin = '@vue/typescript';
  const eslintReactPlugin = 'react-app';
  const eslintTypeScriptParser = '@typescript-eslint/parser';

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

  if (!(
    (config.parser === eslintTypeScriptParser && Array.isArray(config.plugins) && config.plugins.includes(eslintTypeScriptPlugin)) ||
    (config.extends && Array.isArray(config.extends) && (config.extends.includes(eslintVuePlugin) || config.extends.includes(eslintReactPlugin)))
  )) {
    console.log(`${file} must be configured with "parser": "${eslintTypeScriptParser}" and "plugins": ["${eslintTypeScriptPlugin}"] (or an equivalent like "extends": ["${eslintVuePlugin}"] or "extends": ["${eslintReactPlugin}"]), otherwise rules won't be checked.`);
  }

  if (!config.rules) {
    config.rules = {};
  }

  config.rules['@typescript-eslint/no-explicit-any'] = 'error';

  // TODO: check options
  config.rules['@typescript-eslint/explicit-function-return-type'] = 'error';

  if (packageJSONConfig) {
    packageJSONConfig.eslintConfig = config;
    return saveConfig(cwd, file, packageJSONConfig);
  } else if (file === '.eslintrc.js') {
    console.log(`You're using the advanced .eslintrc.js format for your ESLint config, and it can't be overwrited directly, as it could mess up with advanced configuration. So the new strict configuration was saved in .eslintrc.json. As .eslintrc.js has precedence over .eslintrc.json, you need to manually copy the new options from the new .eslintrc.json to your preexisting .eslintrc.js. If you know a way to automate this, please open a PR.`);
    return saveConfig(cwd, '.eslintrc.json', config);
  } else {
    return saveConfig(cwd, file, config);
  }

}
