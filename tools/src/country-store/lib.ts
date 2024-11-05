import chalk from "chalk";
import { CountryFeatures, ContinentCatalog, ContinentName, CountryCatalog } from "./types.js";

/**
 * Get all countries and remove excluded ones
 * @param excluded List of continents to exclude
 * @returns
 */
export function deriveContinents(catalog: ContinentCatalog, excluded: ContinentName[]) {
  console.log(chalk.yellow(`Deriving continents... (${catalog.size})`));

  const continentKeys = [...catalog.keys()];
  const continents = continentKeys.filter((continent) => !excluded.includes(continent));

  continents.sort();

  return continents;
}

/**
 * Pivots a flat Map of strings into a map of arrays based on two value keys.
 *
 * Groups each entry under the specified key while collecting values based on the capture property.
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
 * Reorganize all countries by continent
 */
export function countriesCatalogByContinent(catalog: CountryCatalog): ContinentCatalog {
  if (!catalog || !catalog.size) return new Map();

  console.log(chalk.yellow(`Pivoting country data... (${catalog.size})`));

  return groupAndCollectMap(catalog, "CONTINENT", ({ GU_A3 }) => GU_A3);
}

export function summarizeContinentCatalog(continentCatalog: ContinentCatalog) {
  return continentCatalog.entries().reduce<Map<string, number>>((acc, [continent, countries]) => {
    if (!countries.length) return acc;

    acc.set(continent, countries.length);
    return acc;
  }, new Map());
}

function createCountryCatalog(features: CountryFeatures): CountryCatalog {
  const catalog: CountryCatalog = new Map();

  if (!features || !features.length) return catalog;

  for (const country of features) {
    if (!country) continue;

    catalog.set(country.GU_A3, country);
  }

  return catalog;
}

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
 * Shuffles an array in place using the Durstenfeld shuffle
 * See: https://stackoverflow.com/a/12646864/17461306
 * @param array
 */
function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function getContinentFeatures(continent: ContinentName, catalog: ContinentCatalog, shuffle = false) {
  const original = catalog.get(continent);

  if (!original || !original.length) return null;

  const copy = original.slice();

  if (shuffle) {
    return shuffleArray(copy);
  }

  return copy;
}

export class CountryQueue {
  continent: string;
  catalog: ContinentCatalog;
  countryStack: string[] | null;
  countryBlacklist: string[] = [];

  constructor(continent: ContinentName, catalog: ContinentCatalog) {
    this.continent = continent;
    this.catalog = catalog;
    this.countryStack = getContinentFeatures(this.continent, this.catalog, true);
  }

  reset() {
    if (!this.catalog || !this.continent) return;

    const features = getContinentFeatures(this.continent, this.catalog, true);

    if (!features) return;
    this.countryStack = features.filter((c) => !this.countryBlacklist.includes(c));
  }

  next() {
    if (!this.countryStack) return null;
    if (!this.countryStack.length) this.reset();

    const country = this.countryStack.pop();

    return country;
  }

  #removeFromStack(country: string) {
    if (!this.countryStack) return 0;

    const filtered = this.countryStack.filter((c) => c !== country);
    const removedCount = this.countryStack.length - filtered.length;

    this.countryStack = filtered;

    return removedCount;
  }

  blacklist(country: string) {
    // Remove the country from the current stack
    this.#removeFromStack(country);
    // Prevent it from being selected again
    this.countryBlacklist.push(country);
  }
}
