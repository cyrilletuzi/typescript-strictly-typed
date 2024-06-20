import { findConfig, getConfig, modifyJSON, saveConfig } from "./config-utils.js";

interface DenoJSON {
  compilerOptions?: {
    /* Enabled by default */
    strict?: boolean;
    alwaysStrict?: boolean;
    noImplicitAny?: boolean;
    noImplicitThis?: boolean;
    strictBindCallApply?: boolean;
    strictFunctionTypes?: boolean;
    strictNullChecks?: boolean;
    strictPropertyInitialization?: boolean;
    /* Disabled by default */
    exactOptionalPropertyTypes?: boolean;
    noFallthroughCasesInSwitch?: boolean;
    noImplicitOverride?: boolean;
    noImplicitReturns?: boolean;
    noUncheckedIndexedAccess?: boolean;
    useUnknownInCatchVariables?: boolean;
  };
  lint?: {
    tags?: ("recommended")[];
    include?: (
      "eqeqeq" |
      "explicit-function-return-type" |
      "no-explicit-any" | // in recommended
      "no-non-null-assertion"
      /**
       * Missing:
       * - prefer-arrow-callback
       * - prefer-template
       * - no-unsafe-xxx
       * - prefer-for-of
       * - prefer-nullish-coalescing
       * - prefer-optional-chain
       * - restrict-plus-operands
       * - restrict-template-expressions
       * - strict-boolean-expressions
       * - use-unknown-in-catch-callback-variable
       */
    )[];
  };
}

/**
 * Enable Deno strict compiler and lint options:
 * {@link https://lint.deno.land}
 *
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 */
export async function enableDenoStrict(cwd: string): Promise<boolean> {

  const file = findConfig(cwd, ["deno.json", "deno.jsonc"]);

  if (file === null) {
    return false;
  }

  const config = await getConfig<DenoJSON>(cwd, file);
  if (!config) {
    return false;
  }

  /* Delete compiler options disabled by user which are enabled by default */
  if (config.json.compilerOptions?.strict === false) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strict"], undefined);
  }

  if (config.json.compilerOptions?.alwaysStrict === false) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "alwaysStrict"], undefined);
  }

  if (config.json.compilerOptions?.alwaysStrict === false) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitAny"], undefined);
  }

  if (config.json.compilerOptions?.alwaysStrict === false) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitThis"], undefined);
  }

  if (config.json.compilerOptions?.alwaysStrict === false) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictBindCallApply"], undefined);
  }

  if (config.json.compilerOptions?.alwaysStrict === false) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictFunctionTypes"], undefined);
  }

  if (config.json.compilerOptions?.alwaysStrict === false) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictNullChecks"], undefined);
  }

  if (config.json.compilerOptions?.alwaysStrict === false) {
    config.raw = modifyJSON(config.raw, ["compilerOptions", "strictPropertyInitialization"], undefined);
  }

  /* Enables compiler options disabled by default */
  config.raw = modifyJSON(config.raw, ["compilerOptions", "exactOptionalPropertyTypes"], true);
  config.raw = modifyJSON(config.raw, ["compilerOptions", "noFallthroughCasesInSwitch"], true);
  config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitOverride"], true);
  config.raw = modifyJSON(config.raw, ["compilerOptions", "noImplicitReturns"], true);
  config.raw = modifyJSON(config.raw, ["compilerOptions", "noUncheckedIndexedAccess"], true);
  config.raw = modifyJSON(config.raw, ["compilerOptions", "useUnknownInCatchVariables"], true);

  /* Add recommended lint preset */
  if (!(config.json.lint?.tags?.includes("recommended") ?? false)) {
    config.raw = modifyJSON(config.raw, ["lint", "tags"], "recommended", { isArrayInsertion: true });
  }

  /* Add lint rules */
  if (!(config.json.lint?.include?.includes("eqeqeq") ?? false)) {
    config.raw = modifyJSON(config.raw, ["lint", "include"], "eqeqeq", { isArrayInsertion: true });
  }
  
  if (!(config.json.lint?.include?.includes("explicit-function-return-type") ?? false)) {
    config.raw = modifyJSON(config.raw, ["lint", "include"], "explicit-function-return-type", { isArrayInsertion: true });
  }

  if (!(config.json.lint?.include?.includes("no-non-null-assertion") ?? false)) {
    config.raw = modifyJSON(config.raw, ["lint", "include"], "no-non-null-assertion", { isArrayInsertion: true });
  }

  return saveConfig(cwd, file, config);

}
