import chalk from "chalk";

import { ContinentCatalog, CountryCatalog, CountryFeatures } from "../types.js";

/**
 * Dynamically loads country data from a JSON file and returns a country catalog.
 *
 * It should unload the data from the import statement to avoid memory issues.
 * @param path
 * @returns
 */
export async function loadCountryCatalog(path: string) {
  try {
    console.log(chalk.yellow(`Loading country data...`));

    const data = await import(path);
    const countryData = data.default;

    if (!countryData || !countryData.length) throw new Error("No country data found");
    console.log(chalk.green(`✔ Found ${path}`));

    return createCountryCatalog(countryData);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

/**
 * Creates an optimized country catalog from country features.
 *
 * This is intended to be used with country data from Mapshaper's JSON output to improve performance.
 *
 * Example:
 *
 * From
 * ```json
 * [
 *   {
 *     "GU_A3": "AFG",
 *     "NAME": "Afghanistan",
 *     "CONTINENT": "Asia",
 *     ...
 *   },
 *   ...
 * ]
 * ```
 * to
 * ```json
 * [
 *   ["AFG", {
 *     "GU_A3": "AFG",
 *     "NAME": "Afghanistan",
 *     "CONTINENT": "Asia",
 *     ...
 *   }],
 *   ...
 * ]
 * ```
 * @param features A list of country features
 * @returns
 */
function createCountryCatalog(features: CountryFeatures): CountryCatalog {
  const catalog: CountryCatalog = new Map();

  if (!features || !features.length) return catalog;

  for (const country of features) {
    if (!country) continue;

    catalog.set(country.GU_A3, country);
  }

  return catalog;
}

/**
 * Pivots a flat Map of strings into a map of arrays based on two value keys.
 *
 * Groups each entry under the specified key while collecting values based on the capture property.
 *
 * Example:
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
 * @param key The key to group the values by
 * @param captureCallback A callback to capture values
 * @returns A Map of captured values grouped by the key
 */
function groupAndCollectMap<T extends Record<string, string | number>, U>(
  map: Map<string, T>,
  key: keyof T,
  captureCallback: (value: T) => U,
) {
  return map.values().reduce<Map<string, U[]>>((acc, value) => {
    const group = String(value[key]);

    if (!group) return acc;

    const groupValues = acc.get(group);
    const captureString = captureCallback(value);

    if (!groupValues) {
      acc.set(group, [captureString]);
    } else {
      groupValues.push(captureString);
    }

    return acc;
  }, new Map());
}

/**
 * Reorganize all countries by continent.
 *
 * Example:
 * ```json
 * [
 *   ["Asia", [ "ABC", "DEF", ... ]],
 *   ["Europe", [ "GHI", "JKL", ... ]],
 *   ...
 * [
 * ```
 * @param catalog A country catalog
 */
export function countriesCatalogByContinent(catalog: CountryCatalog): ContinentCatalog {
  if (!catalog || !catalog.size) return new Map();

  console.log(chalk.yellow(`Pivoting country data... (${catalog.size})`));

  return groupAndCollectMap(catalog, "CONTINENT", ({ GU_A3 }) => GU_A3);
}
