import { cwd } from "node:process";
import { typescriptStrictlyTyped } from "./index.js";
import { logError } from "./log-utils.js";

/* Get the path where the command is invoked */
// oxlint-disable-next-line promise/prefer-await-to-then -- Top-level await not supported for bin cli
typescriptStrictlyTyped(cwd()).catch(() => {
  logError("Unknown error.\n");
});
