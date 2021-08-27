import { checkDependencyVersion, findConfig, getConfig, saveConfig } from './config-utils';
import { modifyJSON } from './config-utils';

interface TSConfig {
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
    /* noUncheckedIndexedAccess?: boolean; */
    noPropertyAccessFromIndexSignature?: boolean;
    forceConsistentCasingInFileNames?: boolean;
    noImplicitOverride?: boolean;
    exactOptionalPropertyTypes?: boolean;
  };
}

/**
 * Enable the following TypeScript compiler options:
 * - `strict`
 * - `noFallthroughCasesInSwitch`
 * - `noImplicitReturns`
 * - `forceConsistentCasingInFileNames`
 * - `noImplicitOverride`
 * - `exactOptionalPropertyTypes`
 * {@link https://www.typescriptlang.org/docs/handbook/compiler-options.html}
 *
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 */
export default function enableTypescriptStrict(cwd: string): boolean {

  const file = findConfig(cwd, ['tsconfig.base.json', 'tsconfig.json']);

  if (!file) {
    return false;
  }

  const config = getConfig<TSConfig>(cwd, file);
  if (!config) {
    return false;
  }

  config.raw = modifyJSON(config.raw, ['compilerOptions', 'strict'], true);
  config.raw = modifyJSON(config.raw, ['compilerOptions', 'noFallthroughCasesInSwitch'], true);
  config.raw = modifyJSON(config.raw, ['compilerOptions', 'noImplicitReturns'], true);
  config.raw = modifyJSON(config.raw, ['compilerOptions', 'forceConsistentCasingInFileNames'], true);

  /*
  if (checkDependencyVersion(cwd, 'typescript', '>=4.1.0')) {
    config.compilerOptions.noUncheckedIndexedAccess = true;
  }
  */

  if (checkDependencyVersion(cwd, 'typescript', '>=4.2.0')) {
    config.raw = modifyJSON(config.raw, ['compilerOptions', 'noPropertyAccessFromIndexSignature'], true);
  }

  if (checkDependencyVersion(cwd, 'typescript', '>=4.3.0')) {
    config.raw = modifyJSON(config.raw, ['compilerOptions', 'noImplicitOverride'], true);
  }

  if (checkDependencyVersion(cwd, 'typescript', '>=4.4.0')) {
    config.raw = modifyJSON(config.raw, ['compilerOptions', 'exactOptionalPropertyTypes'], true);
  }

  /* Clean up options included in strict mode */
  config.raw = modifyJSON(config.raw, ['compilerOptions', 'alwaysStrict'], undefined);
  config.raw = modifyJSON(config.raw, ['compilerOptions', 'noImplicitAny'], undefined);
  config.raw = modifyJSON(config.raw, ['compilerOptions', 'noImplicitThis'], undefined);
  config.raw = modifyJSON(config.raw, ['compilerOptions', 'strictBindCallApply'], undefined);
  config.raw = modifyJSON(config.raw, ['compilerOptions', 'strictFunctionTypes'], undefined);
  config.raw = modifyJSON(config.raw, ['compilerOptions', 'strictNullChecks'], undefined);
  config.raw = modifyJSON(config.raw, ['compilerOptions', 'strictPropertyInitialization'], undefined);
  config.raw = modifyJSON(config.raw, ['compilerOptions', 'useUnknownInCatchVariables'], undefined);

  return saveConfig(cwd, file, config);

}
