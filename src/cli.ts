import { cwd } from "node:process";
import { typescriptStrictlyTyped } from "./index.js";
import { logError } from "./log-utils.js";

/* Get the path where the command is invoked */
typescriptStrictlyTyped(cwd()).catch(() => {
  logError(`Unknown error.\n`);
});
