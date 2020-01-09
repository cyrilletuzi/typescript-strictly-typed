import { findConfig } from './config-utils';
import enableTypeScriptStrict from './typescript-strict';
import enableESLintStrict from './eslint-strict';
import enableTSLintStrict from './tslint-strict';
import enableAngularStrict from './angular-strict';

export default function main() {

  enableTypeScriptStrict();
  enableESLintStrict();
  enableTSLintStrict();
  if (findConfig(['angular.json'])) {
    enableAngularStrict();
  }

}
