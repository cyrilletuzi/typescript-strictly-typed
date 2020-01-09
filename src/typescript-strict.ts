import { findConfig, getConfig, saveConfig } from './config-utils';

export interface TSConfig {
  compilerOptions?: {
    strict?: boolean;
    strictPropertyInitialization?: boolean;
  };
}

export default function enableTypeScriptStrict(): boolean {

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
