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
 *
 * Using:
 * ```json
 * {
 *   "item 1": { "group": "Group 1", "property": "value 1", },
 *   "item 2": { "group": "Group 1", "property": "value 2", },
 * }
 * ```
 *
 * Example:
 * ```ts
 * pivotMap(map, "group", (item) => item.property)
 * ```
 *
 * Result:
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
 * @param mapper A callback to capture the value for each entry
 * @returns A new Map of captured values grouped by the key
 */
export function pivotMap<T extends Record<string, unknown>, U>(
  map: Map<string, T>,
  property: keyof T,
  mapper: (value: T) => U,
) {
  return map.values().reduce<Map<string, U[]>>((entries, entry) => {
    const key = entry[property]?.toString();

    if (!key) return entries;

    const prevValues = entries.get(key);
    const mappedValue = mapper(entry);

    if (prevValues) {
      prevValues.push(mappedValue); // Mutate reference
    } else {
      entries.set(key, [mappedValue]); // Register new list
    }

    return entries;
  }, new Map());
}

/**
 * Pivots a flat Map of strings into a map of arrays based on two value keys.
 *
 * Groups each entry under the specified key while collecting values based on the capture property.
 *
 * Example:
 *
 *
 * Using:
 * ```json
 * {
 *   "item 1": { "group": "Group 1", "property": "value 1", },
 *   "item 2": { "group": "Group 1", "property": "value 2", },
 *   "item 3": { "group": "Group 2", "property": "value 3", },
 *   "item 4": { "group": "Group 2", "property": "value 4", },
 * }
 * ```
 *
 * Example:
 * ```ts
 * pivotTable(map, "group", (item) => item.property)
 * ```
 *
 * Result:
 * ```json
 * {
 *   "Group 1": [
 *     "value 1",
 *     "value 2",
 *     ...
 *   ],
 *   "Group 2": [
 *     "value 3",
 *     "value 4",
 *     ...
 *   ],
 *  ...
 * }
 */
export function pivotTable<T extends Record<string, unknown>, K extends keyof T, V>(
  table: Record<string, T>,
  property: K extends string ? K : never,
  mapper: (value: T) => V,
) {
  return Object.values(table).reduce<Record<string, V[]>>((entries, item) => {
    const keyValue = item[property]?.toString();
    if (!keyValue || keyValue.length === 0) return entries;

    const prevValues = entries[keyValue];
    const mappedValue = mapper(item);

    if (prevValues) {
      prevValues.push(mappedValue); // Mutate reference
    } else {
      entries[keyValue] = [mappedValue]; // Register new list
    }

    return entries;
  }, {});
}

/**
 * Creates a catalog from an array of items.
 * Use the label mapper to capture the label from the item.
 * Use the value mapper to capture the value from the item.
 *
 *  Example:
 *  ```ts
 *  const catalog = createCatalog(items, (item) => item.id), (item) => item);
 *  ```
 *
 *  From:
 *  ```json
 *  [
 *    { id: "id 1", "category": "category 1", ... },
 *    { id: "id 2", "category": "category 1", ... },
 *    { id: "id 3", "category": "category 2", ... },
 *    { id: "id 4", "category": "category 2", ... },
 *    ...
 * ]
 *  ```
 *
 *  Result:
 *  ```json
 *  {
 *    "category 1": [
 *      { id: "id 1", "category": "category 1", ... },
 *      { id: "id 2", "category": "category 1", ... },
 *      ...
 *    ],
 *    "category 2": [
 *      { id: "id 3", "category": "category 2", ... },
 *      { id: "id 4", "category": "category 2", ... },
 *      ...
 *    ],
 *    ...
 *  }
 *  ```
 *
 * @param items An array of objects
 */
// TODO: Clean this up when TypeScript 5.8 is released and supports branched type narrowing
// See: https://www.youtube.com/watch?v=lUl6gtytG64
// See: https://github.com/microsoft/TypeScript/pull/56941
// See: https://devblogs.microsoft.com/typescript/announcing-typescript-5-8-beta/#what’s-next
// Date: 2025/02/03
export function catalogByProperty<T extends Record<string, unknown>, U extends string = string>(
  items: T[],
  labelMapper: (item: T) => U,
): Record<string, T>;
export function catalogByProperty<T extends Record<string, unknown>, V, U extends string = string>(
  items: T[],
  labelMapper: (item: T) => U,
  valueMapper: (item: T) => V,
): Record<string, V>;
export function catalogByProperty<T extends Record<string, unknown>, V, U extends string = string>(
  items: T[],
  labelMapper: (item: T) => U,
  valueMapper?: (item: T) => V,
) {
  const catalog: Record<string, T | V> = {};

  if (items && items.length > 0) {
    for (const item of items) {
      if (!item) continue;

      const mappedLabel = labelMapper(item);
      const mappedValue = valueMapper?.(item);
      catalog[mappedLabel] = mappedValue ?? item;
    }
  }

  return catalog;
}
