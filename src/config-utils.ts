import { dump, load } from "js-yaml";
import { applyEdits, modify, parse, type JSONPath, type ModificationOptions } from "jsonc-parser";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { packageUpSync } from "package-up";
import { coerce, satisfies } from "semver";
import { logError, logInfo } from "./log-utils.js";

export interface Config<T> {
  raw: string;
  json: T;
}

interface PackageJSON {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
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

    const filePath = join(cwd, file);

    if (existsSync(filePath)) {
      return file;
    }

  }

  if (files[0] !== undefined) {
    logInfo(`Can't find ${basename(files[0], ".json")} config file. Skipping this configuration.`);
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
export async function getConfig<T>(cwd: string, file: string): Promise<Config<T> | null> { // eslint-disable-line @typescript-eslint/ban-types

  const filePath = join(cwd, file);

  const raw = readFileSync(filePath, { encoding: "utf8" });

  const fileType = extname(file);

  let config: Config<T> | null = null;
  try {

    switch (fileType) {
      case ".json": {
        config = {
          raw,
          json: parse(raw) as T,
        };
        break;
      }
      case ".yaml":
      case ".yml": {
        const json = load(raw) as T;
        config = {
          raw: JSON.stringify(json),
          json,
        };
        break;
      }
      case ".js":
      case ".cjs": {
        const moduleImport = await import(filePath) as { default: T; };
        const json = moduleImport.default;
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

  const filePath = join(cwd, file);
  const fileType = extname(file);

  let configStringified: string | null = null;
  try {

    switch (fileType) {
      case ".json":
        configStringified = config.raw;
        break;
      case ".yaml":
      case ".yml":
        configStringified = dump(config.json, { indent: 2 });
        break;
    }

  } catch {
    logError(`Can't save ${file} config.`);
    return false;
  }

  if (configStringified === null) {
    logError(`Can't save ${file} config.`);
    return false;
  }

  try {
    writeFileSync(filePath, configStringified);
    return true;
  } catch {
    logError(`Can't write ${file} file. Maybe a permission issue?`);
    return false;
  }

}

export function modifyJSON(json: string, path: JSONPath, value: unknown, otherOptions?: ModificationOptions): string {

  const options: ModificationOptions = {
    formattingOptions: {
      insertSpaces: true,
      tabSize: 2,
    },
    ...otherOptions,
  };

  return applyEdits(json, modify(json.toString(), path, value, options));

}

/**
 * Check a dependency version
 *
 * @param cwd Working directory path
 * @param name Dependency name to check
 * @param wantedVersion Wanted version, eg. `>=2.1.0`
 */
export function checkDependencyVersion(cwd: string, name: string, wantedVersion: string): boolean {

  const filePath = packageUpSync({ cwd });

  if (filePath !== undefined) {

    const packageJsonFile = readFileSync(filePath, { encoding: "utf8" });

    const packageJsonConfig = parse(packageJsonFile) as PackageJSON | undefined;

    const prodDependencyVersion = packageJsonConfig?.dependencies?.[name];
    const devDependencyVersion = packageJsonConfig?.devDependencies?.[name];

    const dependencyVersion = coerce(prodDependencyVersion ?? devDependencyVersion);

    if (dependencyVersion) {
      return satisfies(dependencyVersion, wantedVersion);
    }

  }

  return false;

}

/**
 * Check if dependency is installed
 *
 * @param cwd Working directory path
 * @param name Dependency name to check
 */
export function dependencyExists(cwd: string, name: string): boolean {

  const filePath = packageUpSync({ cwd });

  if (filePath !== undefined) {

    const packageJsonFile = readFileSync(filePath, { encoding: "utf8" });

    const packageJsonConfig = parse(packageJsonFile) as PackageJSON | undefined;

    if (packageJsonConfig?.dependencies && (name in packageJsonConfig.dependencies)) {
      return true;
    } else if (packageJsonConfig?.devDependencies && (name in packageJsonConfig.devDependencies)) {
      return true;
    }

  }

  return false;

}
