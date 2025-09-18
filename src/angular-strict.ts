import { checkDependencyVersion, dependencyExists, findConfig, getConfig, modifyJSON, saveConfig } from "./config-utils.js";
import { logInfo } from "./log-utils.js";

interface TSConfigAngular {
  angularCompilerOptions?: {
    strictInjectionParameters?: boolean;
    strictTemplates?: boolean;
    strictInputAccessModifiers?: boolean;
    typeCheckHostBindings?: boolean;
  };
}

/**
 * Enable the following Angular compiler options:
 * - `strictInjectionParameters`
 * - `strictTemplates`
 * - `strictInputAccessModifiers`
 * - `typeCheckHostBindings`
 * {@link https://angular.dev/reference/configs/angular-compiler-options}
 *
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 */
export async function enableAngularStrict(cwd: string): Promise<boolean> {

  if ((findConfig(cwd, ["angular.json", ".angular.json"]) === null) && !dependencyExists(cwd, "@angular/core")) {
    logInfo(`Can't find an Angular config file. Skipping this configuration.`);
    return false;
  }

  const file = findConfig(cwd, ["tsconfig.base.json", "tsconfig.json"]);

  if (file === null) {
    return false;
  }

  const config = await getConfig<TSConfigAngular>(cwd, file);

  if (!config) {
    return false;
  }

  config.raw = modifyJSON(config.raw, ["angularCompilerOptions", "strictInjectionParameters"], true);
  config.raw = modifyJSON(config.raw, ["angularCompilerOptions", "strictTemplates"], true);
  config.raw = modifyJSON(config.raw, ["angularCompilerOptions", "strictInputAccessModifiers"], true);

  if (checkDependencyVersion(cwd, "@angular/compiler", ">=20.0.0")) {
    config.raw = modifyJSON(config.raw, ["angularCompilerOptions", "typeCheckHostBindings"], true);
  }

  return saveConfig(cwd, file, config);

}
