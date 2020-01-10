import { findConfig, getConfig, saveConfig } from './config-utils';

export interface TSConfig {
  compilerOptions?: {
    strict?: boolean;
    strictPropertyInitialization?: boolean;
  };
}

/**
 * Enable the following TypeScript compiler options:
 * - `strict`
 * {@link https://www.typescriptlang.org/docs/handbook/compiler-options.html}
 *
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 */
export default function enableTypescriptStrict(cwd: string): boolean {

  const file = findConfig(cwd, ['tsconfig.json']);

  if (!file) {
    return false;
  }

  const config = getConfig<TSConfig>(cwd, file);
  if (!config) {
    return false;
  }

  if (!config.compilerOptions) {
    config.compilerOptions = {};
  }

  config.compilerOptions.strict = true;

  return saveConfig(cwd, file, config);

}
