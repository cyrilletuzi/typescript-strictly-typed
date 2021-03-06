import * as path from 'path';
import * as fs from 'fs';
import * as json5 from 'json5';
import * as yaml from 'js-yaml';
import { sync as pkgUpSync } from 'pkg-up';
import * as semver from 'semver';

import { logError, logInfo } from './log-utils';

interface PackageJSON {
  dependencies?: {
    [key: string]: string;
  };
  devDependencies?: {
    [key: string]: string;
  };
}

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

  if (files[0]) {
    logInfo(`Can't find ${path.basename(files[0], '.json')} config file. Skipping this configuration.`);
  }

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
export function getConfig<T extends object>(cwd: string, file: string): T | null { // eslint-disable-line @typescript-eslint/ban-types

  const filePath = path.join(cwd, file);

  const configRaw = fs.readFileSync(filePath, { encoding: 'utf8' });

  const fileType = path.extname(file);

  let configParsed = null;
  try {

    switch (fileType) {
      case '.json':
        configParsed = json5.parse<T>(configRaw);
        break;
      case '.yaml':
      case '.yml':
        configParsed = yaml.load(configRaw) as T;
        break;
      case '.js':
        configParsed = require(filePath) as T; // eslint-disable-line @typescript-eslint/no-var-requires
        break;
    }

  } catch {
    logError(`Can't parse ${file}. Check the file syntax is valid.`);
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

    switch (fileType) {
      case '.json':
        configStringified = JSON.stringify(config, null, 2);
        break;
      case '.yaml':
      case '.yml':
        configStringified = yaml.dump(config, { indent: 2 });
        break;
    }

  } catch {
    logError(`Can't save ${file} config.`);
    return false;
  }

  if (!configStringified) {
    logError(`Can't save ${file} config.`);
    return false;
  }

  try {
    fs.writeFileSync(filePath, configStringified);
    return true;
  } catch {
    logError(`Can't write ${file} file. Maybe a permission issue?`);
    return false;
  }

}

/**
 * Check a dependency version
 *
 * @param cwd Working directory path
 * @param name Dependency name to check
 * @param wantedVersion Wanted version, eg. `>=2.1.0`
 */
export function checkDependencyVersion(cwd: string, name: string, wantedVersion: string): boolean {

  const filePath = pkgUpSync({ cwd });

  if (filePath) {

    const packageJsonFile = fs.readFileSync(filePath, { encoding: 'utf8' });

    const packageJsonConfig = json5.parse<PackageJSON | undefined>(packageJsonFile);

    const prodDependencyVersion = packageJsonConfig?.dependencies?.[name];
    const devDependencyVersion = packageJsonConfig?.devDependencies?.[name];

    const dependencyVersion = semver.coerce(prodDependencyVersion ?? devDependencyVersion);

    if (dependencyVersion) {
      return semver.satisfies(dependencyVersion, wantedVersion);
    }

  }

  return false;

}
