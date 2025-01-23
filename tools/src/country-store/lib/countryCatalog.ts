import type { ContinentMap, CountryData, CountryFeatures, CountryMap } from "../types.js";
import { ICountryCatalog } from "./types.js";
import { pivotMap, shuffleArray } from "./utils.js";

type CountryCatalogProperties = { excludedContinents: string[] };

/**
 * Structures the country data into a catalog to be used for lookups:
 * - Map countries by code for faster access
 * - Group countries by continent
 * - Get a list of continent names
 *
 * Properties:
 * - {@link continents}: A list of continent names
 *
 * Methods:
 * - {@link includes}: Checks if a continent is in the catalog
 * - {@link getCountriesIn}: Returns a list of countries in a given continent
 * - {@link tallyCountriesByContinent}: Returns a map of continents and the number of countries
 */
export class CountryCatalog implements ICountryCatalog {
  #catalog: CountryMap;
  #excludedContinents: string[];
  #continentMap: ContinentMap;
  #continents: string[];

  constructor(countryData: CountryFeatures, properties: CountryCatalogProperties = { excludedContinents: [] }) {
    this.#catalog = this.#createCatalog(countryData);
    this.#excludedContinents = properties.excludedContinents;
    this.#continentMap = this.#groupByContinent();
    this.#continents = this.#getContinents();
  }

  get continents() {
    return this.#continents;
  }

  /**
   * Initiates the country map from a list of country features.
   * @private
   */
  #createCatalog(features: CountryFeatures) {
    const catalog: CountryMap = new Map();

    if (features && features.length > 0) {
      for (const country of features) {
        if (!country) continue;

        catalog.set(country.GU_A3, country);
      }
    }

    return catalog;
  }

  /**
   * Reorganize countries by continent using the country's GU_A3 code.
   *
   * Example:
   * ```json
   * [
   *   [ "Africa", [ "ABC", "DEF", ... ] ],
   *   [ "Antarctica", [ "GHI" ] ],
   *   ...
   * [
   * ```
   * @param catalog A country catalog
   */
  #groupByContinent(): ContinentMap {
    const pivot = pivotMap<CountryData, string>(this.#catalog, "CONTINENT", ({ GU_A3 }) => GU_A3);

    for (const continent of this.#excludedContinents) {
      pivot.delete(continent);
    }

    return pivot;
  }

  /**
   * Returns a list of continents from a {@link ContinentMap}.
   * @param excluded
   * @returns
   */
  #getContinents(): string[] {
    const keys = [...this.#continentMap.keys()];

    return keys.sort();
  }

  /**
   * Returns a list of country A3 codes for a given continent.
   *
   * Optionally shuffles the list.
   *
   * Example:
   *
   * ```ts
   * getContinentFeatures("Africa", catalog);
   * ```
   *
   * From:
   * ```json
   * [
   *   [ "Africa", [ "ABC", "DEF", ... ] ],
   *   [ "Antarctica", [ "GHI" ] ],
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
   * @param shuffle Whether to shuffle the returned list
   * @returns An array of country A3 codes for the given continent or an empty array
   */
  getCountriesIn(continent: string, shuffle = false) {
    const countries = this.#continentMap.get(continent);

    if (!countries || countries.length === 0) return [];

    return shuffle ? shuffleArray(countries) : countries.slice();
  }

  /**
   * Tallies the number of countries in each continent.
   *
   * Example:
   *
   * ```ts
   * tallyCountriesByContinent(catalog);
   * ```
   *
   * From a real example:
   * ```json
   * [
   *   [ "Africa", [ "ABC", "DEF", ... ] ],
   *   [ "Antarctica", [ "HIJ", "KLM", ... ] ],
   *   ...
   * ]
   * ```
   * To:
   * ```json
   * {
   *   "Africa": 57,
   *   "Antarctica": 1,
   *   ...
   * }
   * ```
   * @param catalog A {@link ContinentMap}
   * @returns A {@link Map} of continents and the number of countries
   */
  tallyCountriesByContinent() {
    return this.#continents.reduce<Map<string, number>>((acc, continent) => {
      const length = this.#continentMap.get(continent)?.length;

      if (length) {
        acc.set(continent, length);
      }

      return acc;
    }, new Map());
  }

  includes(continent: string) {
    return this.#continentMap.has(continent);
  }
}
