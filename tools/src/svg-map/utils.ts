export function handleError(error: unknown, context: string) {
  console.error(`Error in ${context}:`, error);
  process.exit(1);
}

function formatTime(time: number, divisor: number = 1000, unit = "s", precision = 1) {
  const timeInSeconds = time / divisor;
  return `${timeInSeconds.toFixed(precision)} ${unit}`;
}

/**
 * Timestamp factory. It records the current time and returns a function that measures the time difference.
 *
 * @returns A function that returns the time difference in seconds
 * @example
 * ```ts
 * const stamp = timeStamp();
 * setTimeout(() => console.log(stamp()), 1000);
 * ```
 */
function createTimeStamp() {
  const startTime = performance.now();
  return () => formatTime(performance.now() - startTime);
}

/**
 * Function to measure the time since its creation.
 * @returns The time difference in seconds
 */
export const timeStamp = createTimeStamp();
