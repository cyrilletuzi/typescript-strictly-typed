import { findConfig, getConfig, saveConfig } from './config-utils';

interface ESLint {
  rules?: {
    '@typescript-eslint/no-explicit-any'?: string | string[];
    '@typescript-eslint/explicit-function-return-type'?: string | string[];
  };
  parser?: string;
  parserOptions?: {
    parser?: string;
  };
  plugins?: string[];
  extends?: string[];
}

interface PackageJSON {
  eslintConfig?: ESLint;
}

export default function enableESLintStrict(): boolean {

  const eslintTypeScriptPlugin = '@typescript-eslint';
  const eslintVuePlugin = '@vue/typescript';
  const eslintReactPlugin = 'react-app';
  const eslintTypeScriptParser = '@typescript-eslint/parser';

  let config: ESLint | null = null;
  let packageJSONConfig: PackageJSON | null = null;

  const file = findConfig(['.eslintrc.json', '.eslintrc.yaml', '.eslintrc.js', 'package.json']);
  if (!file) {
    return false;
  }

  if (file === 'package.json') {
    packageJSONConfig = getConfig<PackageJSON>(file);
    config = packageJSONConfig?.eslintConfig ?? {};
  } else {
    config = getConfig<ESLint>(file);
  }

  if (!config) {
    return false;
  }

  if (
    (!config.parser && !config.parserOptions) ||
    (config.parser !== eslintTypeScriptParser) ||
    (config.parserOptions && (config.parserOptions.parser !== eslintTypeScriptParser))
  ) {
    console.log(`${file} "parser" must be configured with "${eslintTypeScriptParser}", otherwise rules won't be checked.`);
  }

  // TODO: for react-app, by adding the config in default location (ie. in package.json),
  // it will make the lint work in VS Code, but not during react-app compilation
  if (
    (!config.plugins && !config.extends) ||
    (config.plugins && Array.isArray(config.plugins) && !config.plugins.includes(eslintTypeScriptPlugin)) ||
    (config.extends && Array.isArray(config.extends) && !config.extends.includes(eslintVuePlugin) && !config.extends.includes(eslintReactPlugin))
  ) {
    console.log(`Your ${file} must include eitheir "plugins": ["${eslintTypeScriptPlugin}"] (or an equivalent like "extends": ["${eslintVuePlugin}"] or "extends": ["${eslintReactPlugin}"]), otherwise rules won't be checked.`);
  }

  if (!config.rules) {
    config.rules = {};
  }

  config.rules['@typescript-eslint/no-explicit-any'] = 'error';

  // TODO: check options
  config.rules['@typescript-eslint/explicit-function-return-type'] = 'error';

  if (packageJSONConfig) {
    packageJSONConfig.eslintConfig = config;
    return saveConfig(file, packageJSONConfig);
  } else if (file === '.eslintrc.js') {
    console.log(`You're using the advanced .eslintrc.js format for your ESLint config, and it can't be overwrited directly, as it could mess up with advanced configuration. So the new strict configuration was saved in .eslintrc.json. As .eslintrc.js has precedence over .eslintrc.json, you need to manually copy the new options from the new .eslintrc.json to your preexisting .eslintrc.js. If you know a way to automate this, please open a PR.`);
    return saveConfig('.eslintrc.json', config);
  } else {
    return saveConfig(file, config);
  }

}
