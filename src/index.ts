import * as path from 'path';
import * as fs from 'fs';
import * as json5 from 'json5';
import * as yaml from 'js-yaml';

interface TSConfig {
  compilerOptions?: {
    strict?: boolean;
    strictPropertyInitialization?: boolean;
  };
}

interface TSConfigAngular extends TSConfig {
  angularCompilerOptions?: {
    fullTemplateTypeCheck?: boolean;
    strictInjectionParameters?: boolean;
    strictTemplates?: boolean;
  };
}

interface TSLint {
  rules?: {
    "no-any"?: boolean;
    typedef?: boolean | [true, ...string[]];
  };
}

interface ESLint {
  rules?: {
    "@typescript-eslint/no-explicit-any"?: string[];
    "@typescript-eslint/explicit-function-return-type"?: string[];
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

function findConfig(files: string[]): string | null {

  for (const file in files) {

    const filePath = path.join(__dirname, file);

    if (fs.existsSync(filePath)) {
      return file;
    }

  }

  console.log(`Can't find ${files.join(' or ')} file. Are you invoking the command from the correct directory?`);

  return null;

}

function getConfig<T>(file: string): T | null {

  const filePath = path.join(__dirname, file);

  const configRaw = fs.readFileSync(filePath, { encoding: 'utf8' });

  const fileType = path.extname(file);

  let configParsed = null;
  try {
    if (fileType === '.json') {
      configParsed = json5.parse(configRaw) as T;
    } else if (fileType === '.yaml') {
      configParsed = yaml.safeLoad(configRaw) as T;
    }
  } catch {
    console.log(`Can't parse ${file}. Check the file syntax is valid.`);
  }

  return configParsed;

}

function saveConfig(file: string, config: unknown): boolean {

  const filePath = path.join(__dirname, file);
  const fileType = path.extname(file);

  let configStringified: string | null = null;
  try {

    // TODO: manage indentation
    if (fileType === '.json') {
      configStringified = json5.stringify(config, null, 2);
    } else if (fileType === '.yaml') {
      configStringified = yaml.safeDump(config, { indent: 2 });
    }

  } catch {
    console.log(`Can't save ${file} config.`);
    return false;
  }

  if (!configStringified) {
    console.log(`Can't save ${file} config.`);
    return false;
  }

  try {
    fs.writeFileSync(filePath, configStringified);
    return true;
  } catch {
    console.log(`Can't write ${file} file. Maybe a permission issue?`);
    return false;
  }

}

function enableTypeScriptStrict(): boolean {

  const file = findConfig(['tsconfig.json']);

  if (!file) {
    return false;
  }

  const config = getConfig<TSConfig>(file);
  if (!config) {
    return false;
  }

  if (!config.compilerOptions) {
    config.compilerOptions = {};
  }

  config.compilerOptions.strict = true;

  return saveConfig(file, config);

}

function enableTSLintStrict() {

  const file = findConfig(['tslint.json', 'tslint.yaml']);

  if (!file) {
    return false;
  }

  const config = getConfig<TSLint>(file);
  if (!config) {
    return false;
  }

  if (!config.rules) {
    config.rules = {};
  }

  config.rules['no-any'] = true;

  if (config.rules.typedef && Array.isArray(config.rules.typedef) && !config.rules.typedef.includes('call-signature')) {
    config.rules.typedef.push('call-signature');
  } else {
    config.rules.typedef = [true, 'call-signature'];
  }

  return saveConfig(file, config);

}

function enableESLintStrict() {

  const eslintTypeScriptPlugin = '@typescript-eslint';
  const eslintVuePlugin = '@vue/typescript';
  const eslintReactPlugin = 'react-app';
  const eslintTypeScriptParser = '@typescript-eslint/parser';

  let config: ESLint | null = null;
  let packageJSONConfig: PackageJSON | null = null;

  // TODO: manage .eslintrc.js
  const file = findConfig(['.eslintrc.json', '.eslintrc.yaml', 'package.json']);
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

  config.rules['@typescript-eslint/no-explicit-any'] = ['error'];

  // TODO: check options
  config.rules['@typescript-eslint/explicit-function-return-type'] = ['error'];

  if (packageJSONConfig) {
    packageJSONConfig.eslintConfig = config;
    return saveConfig(file, packageJSONConfig);
  } else {
    return saveConfig(file, config);
  }

}

function enableAngularStrict({ strictPropertyInitialization = false } = {}): boolean {

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
