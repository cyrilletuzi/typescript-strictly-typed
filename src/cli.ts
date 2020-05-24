import * as process from 'process';

import typescriptStrictlyTyped from './index';

/* Get the path where the command is invoked */
const cwd = process.cwd()

typescriptStrictlyTyped(cwd);
