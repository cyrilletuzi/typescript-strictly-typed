import * as path from 'path';
import * as fs from 'fs';
import * as json5 from 'json5';
import * as yaml from 'js-yaml';

export function findConfig(files: string[]): string | null {

  for (const file of files) {

    const filePath = path.join(__dirname, file);

    if (fs.existsSync(filePath)) {
      return file;
    }

  }

  console.log(`Can't find ${files.join(' or ')} file. Skipping this configuration.`);

  return null;

}

export function getConfig<T>(file: string): T | null {

  const filePath = path.join(__dirname, file);

  const configRaw = fs.readFileSync(filePath, { encoding: 'utf8' });

  const fileType = path.extname(file);

  let configParsed = null;
  try {
    if (fileType === '.json') {
      configParsed = json5.parse(configRaw) as T;
    } else if (fileType === '.yaml') {
      configParsed = yaml.safeLoad(configRaw) as T;
    } else if (fileType === '.js') {
      configParsed = require(filePath) as T;
    }
  } catch {
    console.log(`Can't parse ${file}. Check the file syntax is valid.`);
  }

  return configParsed;

}

export function saveConfig(file: string, config: unknown): boolean {

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
