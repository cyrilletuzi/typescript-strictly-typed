import * as chalk from 'chalk';

export function logSuccess(message: string): void {
  console.log(`\n${chalk.green(message)}`);
}

export function logWarning(message: string): void {
  console.log(`\n${chalk.yellow(message)}`);
}

export function logError(message: string): void {
  console.log(`\n${chalk.red(message)}`);
}

export function logInfo(message: string): void {
  console.log(`\n${chalk.white(message)}`);
}
