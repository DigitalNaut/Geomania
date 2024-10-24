import chalk from "chalk";
import readlinePromise from "node:readline/promises";

export function handleError(error: unknown, context: string) {
  console.error(`Error in ${context}:`, error);
  process.exit(1);
}

function formatTime(time: number, divisor: number = 1000, unit = "s", precision = 1) {
  const timeInSeconds = time / divisor;
  return `${timeInSeconds.toFixed(precision)} ${unit}`;
}

function createTimeStamp() {
  const startTime = performance.now();
  return () => formatTime(performance.now() - startTime);
}

export const timeStamp = createTimeStamp();

export const inquirer = async function inquiring(question: string) {
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
