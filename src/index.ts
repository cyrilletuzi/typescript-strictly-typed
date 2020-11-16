import { findConfig } from './config-utils';
import { logInfo, logError, logSuccess } from './log-utils';
import enableTypescriptStrict from './typescript-strict';
import enableESLintStrict from './eslint-strict';
import enableTSLintStrict from './tslint-strict';
import enableAngularStrict from './angular-strict';

/**
 * Enable strictly typed configurations for:
 * - TypeScript compiler
 * - ESLint or TSLint rules
 * - Angular compiler (if `angular.json` is detected)
 *
 * @param cwd Working directory path
 */
export default function typescriptStrictlyTyped(cwd: string): void {

  const success: string[] = [];

  if (enableTypescriptStrict(cwd)) {
    success.push('TypeScript');
  }

  if (enableESLintStrict(cwd)) {
    success.push('ESLint');
  }

  if (enableTSLintStrict(cwd)) {
    success.push('TSLint');
  }

  if (findConfig(cwd, ['angular.json', '.angular.json', 'angular-cli.json', '.angular-cli.json'])
     && enableAngularStrict(cwd)) {
    success.push('Angular');
  }

  if (success.length === 0) {
    logError(`Configuration failed. Please fix the issues and run the command again.\n`);
  } else {
    logSuccess(`Configuration finished. It succeeded for: ${success.join(', ')}.\n`);
  }

}
