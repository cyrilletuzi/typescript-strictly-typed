import * as path from 'path';
import * as fs from 'fs';
import * as json5 from 'json5';
import * as yaml from 'js-yaml';

/**
 * Search the config file of a tool
 *
 * @param cwd Working directory path
 * @param files List of possible config file names
 *
 * @returns The first config file found, or `null`
 */
export function findConfig(cwd: string, files: string[]): string | null {

  for (const file of files) {

    const filePath = path.join(cwd, file);

    if (fs.existsSync(filePath)) {
      return file;
    }

  }

  console.log(`Can't find ${files.join(' or ')} file. Skipping this configuration.`);

  return null;

}

/**
 * Get and parse the config of a tool
 *
 * @param cwd Working directory path
 * @param file Config file name. Allowed format: `.json`, `.yaml`/`.yml` and `.js`
 *
 * @returns The parsed config, or `null`
 */
export function getConfig<T>(cwd: string, file: string): T | null {

  const filePath = path.join(cwd, file);

  const configRaw = fs.readFileSync(filePath, { encoding: 'utf8' });

  const fileType = path.extname(file);

  let configParsed = null;
  try {

    switch (fileType) {
      case '.json':
        configParsed = json5.parse(configRaw) as T;
        break;
      case '.yaml':
      case '.yml':
        configParsed = yaml.safeLoad(configRaw) as T;
        break;
      case '.js':
        configParsed = require(filePath) as T;
        break;
    }

  } catch {
    console.log(`Can't parse ${file}. Check the file syntax is valid.`);
  }

  return configParsed;

}

/**
 * Write config file on disk
 *
 * @param cwd Working directory path
 * @param file Config file name. Allowed format: `.json` and `.yaml`/`.yml`
 * @param config The file content
 *
 * @returns A boolean for success or failure
 */
export function saveConfig(cwd: string, file: string, config: unknown): boolean {

  const filePath = path.join(cwd, file);
  const fileType = path.extname(file);

  let configStringified: string | null = null;
  try {

    // TODO: manage indentation
    switch (fileType) {
      case '.json':
        configStringified = JSON.stringify(config, null, 2);
        break;
      case '.yaml':
      case '.yml':
        configStringified = yaml.safeDump(config, { indent: 2 });
        break;
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
