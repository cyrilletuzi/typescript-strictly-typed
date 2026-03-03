import { checkDependencyVersion, findConfig, getConfig, modifyJSON, saveConfig } from "./config-utils.js";

interface TSConfig {
  readonly extends?: string | readonly string[];
  readonly compilerOptions?: {
    readonly strict?: boolean;
    readonly noImplicitAny?: boolean;
    readonly strictNullChecks?: boolean;
    readonly noImplicitThis?: boolean;
    readonly alwaysStrict?: boolean | undefined;
    readonly strictBindCallApply?: boolean;
    readonly strictFunctionTypes?: boolean;
    readonly strictPropertyInitialization?: boolean;
    readonly useUnknownInCatchVariables?: boolean;
    readonly noFallthroughCasesInSwitch?: boolean;
    readonly noImplicitReturns?: boolean;
    readonly noUncheckedIndexedAccess?: boolean;
    readonly noPropertyAccessFromIndexSignature?: boolean;
    readonly noImplicitOverride?: boolean;
    readonly exactOptionalPropertyTypes?: boolean;
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

  /* If the configuration is not extending another one,
   * clean up options included in strict mode to keep configuration small */
  if (config.json.extends === undefined) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "alwaysStrict"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitAny"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitThis"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictBindCallApply"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictFunctionTypes"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictNullChecks"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictPropertyInitialization"], undefined);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "useUnknownInCatchVariables"], undefined);
  }
  /* Otherwise, specific flags could be disabled in the parent configuration, so we enable them individually */
  else {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "alwaysStrict"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitAny"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitThis"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictBindCallApply"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictFunctionTypes"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictNullChecks"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictPropertyInitialization"], true);
    config.raw = modifyJSON(config.raw, ["compilerOptions", "useUnknownInCatchVariables"], true);
  }

  return saveConfig(cwd, file, config);

}
