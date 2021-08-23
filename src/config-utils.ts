import * as path from 'path';
import * as fs from 'fs';
import { applyEdits, JSONPath, ModificationOptions, modify, parse } from 'jsonc-parser';
import * as yaml from 'js-yaml';
import { sync as pkgUpSync } from 'pkg-up';
import * as semver from 'semver';

import { logError, logInfo } from './log-utils';

export interface Config<T> {
  raw: string;
  json: T;
}

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
 * Get the config of a tool
 *
 * @param cwd Working directory path
 * @param file Config file name. Allowed format: `.json`, `.yaml`/`.yml` and `.js`
 *
 * @returns The config in raw (string) and JSON formats, or `null`
 */
export function getConfig<T>(cwd: string, file: string): Config<T> | null { // eslint-disable-line @typescript-eslint/ban-types

  const filePath = path.join(cwd, file);

  const raw = fs.readFileSync(filePath, { encoding: 'utf8' });

  const fileType = path.extname(file);

  let config: Config<T> | null = null;
  try {

    switch (fileType) {
      case '.json': {
        config = {
          raw,
          json: parse(raw) as T,
        };
        break;
      }
      case '.yaml':
      case '.yml': {
        const json = yaml.load(raw) as T;
        config = {
          raw: JSON.stringify(json),
          json,
        };
        break;
      }
      case '.js': {
        const json = require(filePath) as T; // eslint-disable-line @typescript-eslint/no-var-requires
        config = {
          raw: JSON.stringify(json),
          json,
        };
        break;
      }
    }

  } catch {
    logError(`Can't parse ${file}. Check the file syntax is valid.`);
  }

  return config;

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
export function saveConfig(cwd: string, file: string, config: Config<unknown>): boolean {

  const filePath = path.join(cwd, file);
  const fileType = path.extname(file);

  let configStringified: string | null = null;
  try {

    switch (fileType) {
      case '.json':
        configStringified = config.raw;
        break;
      case '.yaml':
      case '.yml':
        configStringified = yaml.dump(config.json, { indent: 2 });
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

export function modifyJSON(json: string, path: JSONPath, value: unknown, options?: ModificationOptions): string {

  return applyEdits(json, modify(json.toString(), path, value, options ?? {}));

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

    const packageJsonConfig = parse(packageJsonFile) as PackageJSON | undefined;

    const prodDependencyVersion = packageJsonConfig?.dependencies?.[name];
    const devDependencyVersion = packageJsonConfig?.devDependencies?.[name];

    const dependencyVersion = semver.coerce(prodDependencyVersion ?? devDependencyVersion);

    if (dependencyVersion) {
      return semver.satisfies(dependencyVersion, wantedVersion);
    }

  }

  return false;

}
