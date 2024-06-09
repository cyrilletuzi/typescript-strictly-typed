import { enableAngularStrict } from "./angular-strict.js";
import { enableBiomeStrict } from "./biome-strict.js";
import { isGitStatusDirty } from "./check-git-status.js";
import { findConfig } from "./config-utils.js";
import { enableESLintFlatStrict } from "./eslint-flat-strict.js";
import { logError, logSuccess } from "./log-utils.js";
import { enableTypescriptStrict } from "./typescript-strict.js";

/**
 * Enable strictly typed configurations for:
 * - TypeScript compiler
 * - ESLint rules
 * - Biome rules
 * - Angular compiler (if `angular.json` is detected)
 *
 * @param cwd Working directory path
 */
export async function typescriptStrictlyTyped(cwd: string): Promise<void> {

  if (isGitStatusDirty(cwd) === true) {
    // return;
  }

  const success: string[] = [];

  if (await enableTypescriptStrict(cwd)) {
    success.push("TypeScript");
  }

  // if (await enableESLintStrict(cwd)) {
  //   success.push("ESLint");
  // }

  if (enableESLintFlatStrict(cwd)) {
    success.push("ESLint");
  }

  if (await enableBiomeStrict(cwd)) {
    success.push("Biome");
  }

  if (findConfig(cwd, ["angular.json", ".angular.json", "angular-cli.json", ".angular-cli.json"]) !== null
    && await enableAngularStrict(cwd)) {
    success.push("Angular");
  }

  if (success.length === 0) {
    logError(`Configuration failed. Please fix the issues and run the command again.\n`);
  } else {
    logSuccess(`Configuration finished. It succeeded for: ${success.join(", ")}.\n`);
  }

}
