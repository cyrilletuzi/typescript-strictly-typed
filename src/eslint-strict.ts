import { findConfig, getConfig, saveConfig } from './config-utils';
import { logWarning } from './log-utils';

type ESLintErrorLevel = 'error' | 'warn' | 'off';

interface ESLintRules {
  '@typescript-eslint/no-explicit-any'?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  '@typescript-eslint/explicit-module-boundary-types'?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  '@angular-eslint/template/no-any'?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
}

interface ESLint {
  rules?: ESLintRules;
  plugins?: string[];
  extends?: string | string[];
  overrides?: {
    files?: string | string[];
    plugins?: string[];
    extends?: string | string[];
    rules?: ESLintRules;
  }[];
}

interface PackageJSON {
  eslintConfig?: ESLint;
}

/**
 * Enable the following ESLint rules:
 * - `@typescript-eslint/no-explicit-any`
 * - `@typescript-eslint/explicit-module-boundary-types`
 * {@link https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin}
 *
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 */
export default function enableESLintStrict(cwd: string): boolean {

  const possibleConfigFiles = ['.eslintrc.json', '.eslintrc.yaml', '.eslintrc.yml', '.eslintrc.js', 'package.json'];
  const tsFilesConfig = '*.ts';
  const htmlFilesConfig = '*.html';
  const eslintAngularTemplatePlugin = '@angular-eslint/template' as const;

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

  let tsConfigAdded = false;

  /* If there is an override, rules must be set inside it, or they won't be checked */
  for (const override of config.overrides ?? []) {

    const files = normalizeConfigToArray(override.files);

    if (files.some((file) => file.includes(tsFilesConfig))) {

      addTSConfig(override);

      tsConfigAdded = true;

    }

    if (files.some((file) => file.includes(htmlFilesConfig))) {

      const extendsConfig = normalizeConfigToArray(override.extends);

      if (override.plugins?.includes(eslintAngularTemplatePlugin)
      || extendsConfig.some((extendConfig) => extendConfig.includes(eslintAngularTemplatePlugin)))

      addAngularHTMLConfig(override);

    }

  }

  /* Add rules at root level */
  if (!tsConfigAdded) {
    addTSConfig(config);
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
    const configExtends = normalizeConfigToArray(config.extends);

    for (const configExtend of configExtends) {
      if (configExtend.includes(extension)) return;
    }

    /* Case: plugin in `overrides[x].extends` */
    for (const override of config.overrides ?? []) {

      if (override.plugins?.includes(eslintTypeScriptPlugin)) return;

      const overrideExtends = normalizeConfigToArray(override.extends);

      for (const overrideExtend of overrideExtends) {
        if (overrideExtend.includes(extension)) return;
      }

    }

  }

  logWarning(`ESLint must be configured with "${eslintTypeScriptPlugin}" plugin or with a tool extending it like "${eslintVuePlugin}", "${eslintReactPlugin}" or "${eslintAngularPlugin}", otherwise rules won't be checked.`);

}

function addTSConfig(config: Pick<ESLint, 'rules'>): void {

  if (!config.rules) {
    config.rules = {};
  }

  if (Array.isArray(config.rules['@typescript-eslint/no-explicit-any'])) {
    config.rules['@typescript-eslint/no-explicit-any'][0] = 'error';
  } else {
    config.rules['@typescript-eslint/no-explicit-any'] = 'error';
  }

  if (Array.isArray(config.rules['@typescript-eslint/explicit-module-boundary-types'])) {
    config.rules['@typescript-eslint/explicit-module-boundary-types'][0] = 'error';
  } else {
    config.rules['@typescript-eslint/explicit-module-boundary-types'] = 'error';
  }

}

function addAngularHTMLConfig(config: Pick<ESLint, 'rules'>): void {

  if (!config.rules) {
    config.rules = {};
  }

  if (Array.isArray(config.rules['@angular-eslint/template/no-any'])) {
    config.rules['@angular-eslint/template/no-any'][0] = 'error';
  } else {
    config.rules['@angular-eslint/template/no-any'] = 'error';
  }

}

function normalizeConfigToArray(config?: string | string[]): string[] {

  return Array.isArray(config) ? config : config ? [config] : [];

}
