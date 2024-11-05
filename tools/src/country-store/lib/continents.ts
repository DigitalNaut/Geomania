import chalk from "chalk";

import { ContinentCatalog, ContinentName } from "../types.js";
import { shuffleArray } from "./utils.js";

/**
 * Derives a list of continents from a catalog.
 *
 * Example:
 *
 * From:
 * ```json
 * [
 *   ["Africa", {
 *     "GU_A3": "AFG",
 *     "NAME": "Afghanistan"
 *     ...
 *   }],
 *   ...
 * ]
 * ```
 * To:
 * ```json
 * [
 *   "Africa",
 *   "Asia",
 *   ...
 * ]
 * ```
 *
 * @param catalog A continent catalog
 * @param excluded List of continents to exclude
 * @returns List of continent names
 */
export function getContinents(catalog: ContinentCatalog, excluded: ContinentName[]) {
  console.log(chalk.yellow(`Deriving continents... (${catalog.size})`));

  const continentKeys = [...catalog.keys()];
  const continents = continentKeys.filter((continent) => !excluded.includes(continent));

  continents.sort();

  return continents;
}

/**
 * Reduces a continent catalog to a map of continent names to country count.
 *
 * Example:
 * ```json
 * [
 *   ["Africa", 1],
 *   ["Asia", 2],
 *   ...
 * ]
 * ```
 * @param continentCatalog A continent catalog
 * @returns A map of continent names to country count
 */
export function summarizeContinentCatalog(continentCatalog: ContinentCatalog) {
  return continentCatalog.entries().reduce<Map<string, number>>((acc, [continent, countries]) => {
    if (!countries.length) return acc;

    acc.set(continent, countries.length);
    return acc;
  }, new Map());
}

/**
 * Returns a list of countries for a given continent.
 *
 * Example:
 * ```json
 * [
 *   ["Asia": [ "ABC", "DEF", ... ]],
 *   ["Europe": [ "GHI", "JKL", ... ]],
 *   ...
 * ]
 * ```
 * @param continent Name of the continent
 * @param catalog A country catalog grouped by continent
 * @param shuffle Whether to shuffle the returned list
 * @returns An array of countries for the given continent
 */
export function getContinentFeatures(continent: ContinentName, catalog: ContinentCatalog, shuffle = false) {
  const original = catalog.get(continent);

  if (!original || !original.length) return null;

  const copy = original.slice();

  if (shuffle) {
    shuffleArray(copy);
  }

  return copy;
}
