import { findConfig, getConfig, saveConfig } from './config-utils';

interface TSLint {
  rules?: {
    "no-any"?: boolean;
    typedef?: boolean | [true, ...string[]];
  };
}

export default function enableTSLintStrict() {

  const file = findConfig(['tslint.json', 'tslint.yaml']);

  if (!file) {
    return false;
  }

  const config = getConfig<TSLint>(file);
  if (!config) {
    return false;
  }

  if (!config.rules) {
    config.rules = {};
  }

  config.rules['no-any'] = true;

  if (config.rules.typedef && Array.isArray(config.rules.typedef) && !config.rules.typedef.includes('call-signature')) {
    config.rules.typedef.push('call-signature');
  } else {
    config.rules.typedef = [true, 'call-signature'];
  }

  return saveConfig(file, config);

}
