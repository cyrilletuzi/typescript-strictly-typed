import * as path from 'path';
import * as fs from 'fs';
import * as json5 from 'json5';

interface TSConfig {
  compilerOptions?: {
    strict?: boolean;
    strictPropertyInitialization?: boolean;
  };
}

interface TSLint {
  rules?: {
    "no-any"?: boolean;
    typedef?: boolean | [true, ...string[]];
  };
}

function checkConfig(file: string): boolean {

  const filePath = path.join(__dirname, file);

  return fs.existsSync(filePath);

}

function getConfig<T>(file: string): T | null {

  const filePath = path.join(__dirname, file);

  const configRaw = fs.readFileSync(filePath, { encoding: 'utf8' });

  let configParsed = null;
  try {
    configParsed = json5.parse(configRaw) as T;
  } catch {
    console.log(`Can't parse ${file}. Check the file syntax is valid.`);
  }

  return configParsed;

}

function saveConfig(file: string, config: unknown): void {

  const filePath = path.join(__dirname, file);

  // TODO: manage indentation
  const configStringified = json5.stringify(config);

  try {
    fs.writeFileSync(filePath, configStringified);
  } catch {
    console.log(`Can't write ${file} file. Maybe a permission issue?`);
  }

}

function enableTypeScriptStrict({ strictPropertyInitialization = true } = {}): boolean {

  const file = 'tsconfig.json';

  if (!checkConfig(file)) {
    console.log(`Can't find ${file} file. Are you invoking the command from the correct directory?`);
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

  if (strictPropertyInitialization === false) {
    config.compilerOptions.strictPropertyInitialization = false;
  }

  saveConfig(file, config);

  return true;

}

function enableTSLintStrict() {

  const file = 'tslint.json';

  if (!checkConfig(file)) {
    console.log(`Can't find ${file} file. Did you install and configure tslint?`);
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

  saveConfig(file, config);

  return true;

}
