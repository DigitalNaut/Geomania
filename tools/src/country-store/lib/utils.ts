/**
 * Shuffles an array using the Durstenfeld shuffle
 * See: https://stackoverflow.com/a/12646864/17461306
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
export function shuffleArray<T>(array: T[]) {
  if (array.length === 0) return [];

  const copy = array.slice();

  for (let i = copy.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

/**
 * Selects a random item from an array
 *  @param array The array to select from
 * @returns A random item from the array
 */
export function selectRandom<T>(list: T[]) {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

/**
 * Pivots a flat Map of strings into a map of arrays based on two value keys.
 *
 * Groups each entry under the specified key while collecting values based on the capture property.
 *
 * Example:
 *
 * ```ts
 * groupAndCollectMap(map, "group", ({ property}) => property);
 * ```
 *
 * From
 * ```json
 * {
 *   "item 1": { "group": "Group 1", "property": "value 1", },
 *   "item 2": { "group": "Group 1", "property": "value 2", },
 * }
 * ```
 * using `groupAndCollectMap(map, "group", (item) => item.property)`
 * ```json
 * [
 *   ["Group 1", [
 *     "value 1",
 *     "value 1",
 *     ...
 *   ]],
 *  ...
 * ]
 * ```
 * @param map A flat Map of strings
 * @param property The property to group by
 * @param capture A callback to capture the value for each entry
 * @returns A new Map of captured values grouped by the key
 */
export function pivotMap<T extends Record<string, unknown>, U>(
  map: Map<string, T>,
  property: keyof T,
  capture: (value: T) => U,
) {
  return map.values().reduce<Map<string, U[]>>((entries, entry) => {
    const key = entry[property]?.toString();

    if (!key) return entries;

    const prevValues = entries.get(key);
    const newValue = capture(entry);

    if (prevValues) {
      prevValues.push(newValue); // Mutate reference
    } else {
      entries.set(key, [newValue]); // Register new list
    }

    return entries;
  }, new Map());
}
