import chalk from "chalk";
import { exec } from "child_process";
import readlinePromise from "node:readline/promises";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function runCommand(command: string, description: string) {
  console.log(`\n${chalk.yellow(description)}...`);
  return execPromise(command, { cwd: __dirname });
}

export const inquire = async function inquiring(question: string) {
  const lineReader = readlinePromise.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>(async (resolve, reject) => {
    try {
      const response = await lineReader.question(chalk.yellow(question));
      resolve(response);
    } catch (error) {
      console.error(error);
      reject(error);
    } finally {
      lineReader.close();
    }
  });
};
