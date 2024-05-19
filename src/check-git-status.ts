import { execSync } from "node:child_process";
import { logError } from "./log-utils.js";

export function isGitStatusDirty(cwd: string): boolean | undefined {

  // Check if Git is available
  try {
    execSync("git --version", { cwd, encoding: "utf8" });
  } catch {
    return;
  }

  // Check if the working directory is a git repo
  try {
    execSync("git rev-parse --is-inside-work-tree", { cwd, encoding: "utf8" });
  } catch {
    return;
  }

  // Check if the repo is clean
  try {

    const gitStatus = execSync("git status --porcelain", { cwd, encoding: "utf8" });

    if (gitStatus.trim() === "") {
      return false;
    }

    logError(`The git repository is not clean. Please commit or stash any changes before using this command.`);
    return true;

  } catch {
    return;
  }

}
