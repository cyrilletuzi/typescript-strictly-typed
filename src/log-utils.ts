import { log } from "node:console";
import { styleText } from "node:util";

export function logSuccess(message: string): void {
  log(`\n${styleText("green", message)}`);
}

export function logWarning(message: string): void {
  log(`\n${styleText("yellow", message)}`);
}

export function logError(message: string): void {
  log(`\n${styleText("red", message)}`);
}

export function logInfo(message: string): void {
  log(`\n${styleText("white", message)}`);
}
