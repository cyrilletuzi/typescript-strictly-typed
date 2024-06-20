import { checkDependencyVersion, findConfig, getConfig, modifyJSON, saveConfig } from "./config-utils.js";

interface TSConfig {
  extends?: string | string[];
  compilerOptions?: {
    strict?: boolean;
    noImplicitAny?: boolean;
    strictNullChecks?: boolean;
    noImplicitThis?: boolean;
    alwaysStrict?: boolean | undefined;
    strictBindCallApply?: boolean;
    strictFunctionTypes?: boolean;
    strictPropertyInitialization?: boolean;
    useUnknownInCatchVariables?: boolean;
    noFallthroughCasesInSwitch?: boolean;
    noImplicitReturns?: boolean;
    noUncheckedIndexedAccess?: boolean;
    noPropertyAccessFromIndexSignature?: boolean;
    noImplicitOverride?: boolean;
    exactOptionalPropertyTypes?: boolean;
  };
}

/**
 * Enable strict TypeScript compiler options
 * {@link https://www.typescriptlang.org/docs/handbook/compiler-options.html}
 *
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 */
export async function enableTypescriptStrict(cwd: string): Promise<boolean> {

  const file = findConfig(cwd, ["tsconfig.base.json", "tsconfig.json"]);

  if (file === null) {
    return false;
  }

  const config = await getConfig<TSConfig>(cwd, file);
  if (!config) {
    return false;
  }

  config.raw = modifyJSON(config.raw, ["compilerOptions", "strict"], true);

  if (checkDependencyVersion(cwd, "typescript", ">=4.4.0")) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "exactOptionalPropertyTypes"], true);
  }

  config.raw = modifyJSON(config.raw, ["compilerOptions", "noFallthroughCasesInSwitch"], true);

  if (checkDependencyVersion(cwd, "typescript", ">=4.3.0")) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitOverride"], true);
  }

  config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitReturns"], true);

  if (checkDependencyVersion(cwd, "typescript", ">=4.2.0")) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noPropertyAccessFromIndexSignature"], true);
  }

  /* Available since 4.1.0 but before 5.0.0 compiler was not smart enough and thus too annoying with Records
   * Still annoying with arrays, but it should not happen if using modern syntaxes */
  if (checkDependencyVersion(cwd, "typescript", ">=5.0.0")) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noUncheckedIndexedAccess"], true);
  }

  /* If the configuration is extending another one, specific flags could be disabled
   * in the parent configuration, so we enable them individually */
  if (config.json.extends !== undefined) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "alwaysStrict"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitAny"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitThis"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictBindCallApply"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictFunctionTypes"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictNullChecks"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictPropertyInitialization"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "useUnknownInCatchVariables"], true);
  }
  /* Otherwise, clean up options included in strict mode to keep configuration small */
  else {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "alwaysStrict"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitAny"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitThis"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictBindCallApply"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictFunctionTypes"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictNullChecks"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictPropertyInitialization"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "useUnknownInCatchVariables"], undefined);
  }

  return saveConfig(cwd, file, config);

}
