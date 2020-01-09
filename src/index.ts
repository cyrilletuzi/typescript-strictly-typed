import * as path from 'path';
import * as fs from 'fs';
import * as json5 from 'json5';

interface TSConfig {
  compilerOptions?: {
    strict?: boolean;
    strictPropertyInitialization?: boolean;
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
    console.log(`Can't parse ${file}.`);
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

  const tsConfig = getConfig<TSConfig>(file);

  if (!tsConfig) {
    console.log(`Can't parse ${file}. Check the file syntax is valid.`);
    return false;
  }

  if (!tsConfig.compilerOptions) {
    console.log(`"compilerOptions" is missing in ${file}.`);
    return false;
  }

  tsConfig.compilerOptions.strict = true;

  if (strictPropertyInitialization === false) {
    tsConfig.compilerOptions.strictPropertyInitialization = false;
  }

  saveConfig(file, tsConfig);

  return true;

}
