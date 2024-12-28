import chalk from "chalk";

import { ContinentCatalog, ContinentName } from "../types.js";
import { shuffleArray } from "./utils.js";

/**
 * Returns a list of countries for a given continent from a catalog.
 * Optionally shuffles the list.
 *
 * Example:
 *
 * ```ts
 * getContinentFeatures("Asia", catalog);
 * ```
 *
 * From:
 * ```json
 * [
 *   ["Asia", [ "ABC", "DEF", ... ]],
 *   ["Europe", [ "GHI", "JKL", ... ]],
 *   ...
 * ]
 * ```
 * To:
 * ```json
 * [
 *   "ABC",
 *   "DEF",
 *   ...
 * ]
 * ```
 *
 * @param continent Name of the continent
 * @param catalog A country catalog grouped by continent
 * @param shuffle Whether to shuffle the returned list
 * @returns An array of countries for the given continent
 */
export function getContinentFeatures(continent: ContinentName, catalog: ContinentCatalog, shuffle = false) {
  const original = catalog.get(continent);

  if (!original || original.length === 0) return null;

  const copy = original.slice();

  if (shuffle) {
    shuffleArray(copy);
  }

  return copy;
}

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
export function getContinents(catalog: ContinentCatalog, excluded?: ContinentName[]) {
  console.log(chalk.yellow(`Deriving continents... (${catalog.size})`));

  const continentKeys = [...catalog.keys()];
  // If excluding continents, filter those out
  const continents = excluded ? continentKeys.filter((continent) => !excluded.includes(continent)) : continentKeys;

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
    if (countries.length === 0) return acc;

    acc.set(continent, countries.length);
    return acc;
  }, new Map());
}
