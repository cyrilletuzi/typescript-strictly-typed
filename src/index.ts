import { findConfig } from './config-utils';
import enableTypeScriptStrict from './typescript-strict';
import enableESLintStrict from './eslint-strict';
import enableTSLintStrict from './tslint-strict';
import enableAngularStrict from './angular-strict';

export default function main() {

  const success: string[] = [];

  if (enableTypeScriptStrict()) {
    success.push('TypeScript');
  }

  if (enableESLintStrict()) {
    success.push('ESLint');
  }

  if (enableTSLintStrict()) {
    success.push('TSLint');
  }

  if (findConfig(['angular.json']) && enableAngularStrict()) {
    success.push('Angular');
  }

  console.log(`Configuration finished. It succeeded for: ${success.join(', ')}.`);

}
