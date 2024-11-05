/**
 * Shuffles an array in place using the Durstenfeld shuffle
 * See: https://stackoverflow.com/a/12646864/17461306
 * @param array The array to shuffle in place
 */
export function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
