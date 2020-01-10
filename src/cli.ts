import * as process from 'process';
import * as minimist from 'minimist';

import typescriptStrictlyStrict from './index';

/* Get the path where the command is invoked */
const cwd = process.cwd()

/* Get and format user CLI arguments */
const options = minimist(process.argv.slice(2));

/* Sanitize the options */
const strictPropertyInitialization = ('strictPropertyInitialization' in options
                                     && typeof options.strictPropertyInitialization === 'boolean') ?
                                     options.strictPropertyInitialization : undefined;

typescriptStrictlyStrict(cwd, { strictPropertyInitialization });
