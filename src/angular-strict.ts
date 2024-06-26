import { dependencyExists, findConfig, getConfig, modifyJSON, saveConfig } from "./config-utils.js";
import { logInfo } from "./log-utils.js";

interface TSConfigAngular {
  angularCompilerOptions?: {
    strictInjectionParameters?: boolean;
    strictTemplates?: boolean;
    strictInputAccessModifiers?: boolean;
  };
}

/**
 * Enable the following Angular compiler options:
 * - `strictInjectionParameters`
 * - `strictTemplates`
 * - `strictInputAccessModifiers`
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

  return saveConfig(cwd, file, config);

}
