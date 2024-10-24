import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";
const execPromise = promisify(exec);

export async function runCommand(command: string, description: string) {
  try {
    console.log(`\n${chalk.yellow(description)}...`);
    return execPromise(command);
  } catch (error) {
    console.error(`Error executing ${description}:`, error);
  }
}
