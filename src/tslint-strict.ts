import { findConfig, getConfig, saveConfig } from './config-utils';

interface TSLint {
  rules?: {
    'no-any'?: boolean;
    typedef?: boolean | [true, ...string[]];
  };
}

/**
 * Enable the following TSLint rules:
 * - `no-any`
 * - `typedef` with `call-signature` option
 * {@link https://palantir.github.io/tslint/rules/}
 *
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 *
 */
export default function enableTSLintStrict(cwd: string): boolean {

  const file = findConfig(cwd, ['tslint.json', 'tslint.yaml', 'tslint.yml']);

  if (!file) {
    return false;
  }

  const config = getConfig<TSLint>(cwd, file);
  if (!config) {
    return false;
  }

  if (!config.rules) {
    config.rules = {};
  }

  config.rules['no-any'] = true;

  /* `typedef` has multiple options, existing ones must not be deleted */
  if (config.rules.typedef && Array.isArray(config.rules.typedef)) {
    if (!config.rules.typedef.includes('call-signature')) {
      config.rules.typedef.push('call-signature');
    }
  } else {
    config.rules.typedef = [true, 'call-signature'];
  }

  return saveConfig(cwd, file, config);

}
