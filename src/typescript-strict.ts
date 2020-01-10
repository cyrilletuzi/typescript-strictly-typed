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
 * @returns A boolean for success or failure
 */
export default function enableTypescriptStrict(): boolean {

  const file = findConfig(['tsconfig.json']);

  if (!file) {
    return false;
  }

  const config = getConfig<TSConfig>(file);
  if (!config) {
    return false;
  }

  if (!config.compilerOptions) {
    config.compilerOptions = {};
  }

  config.compilerOptions.strict = true;

  return saveConfig(file, config);

}
