import { CountryCatalog } from "./countryCatalog.js";
import type { ICountryQueue } from "./types.js";

type CountryQueueArgs = {
  catalog: CountryCatalog;
  continent: string;
};

type CountryQueueProperties = {
  autoRequeue?: boolean;
};

/**
 * Manages a queue of countries for a given continent in a {@link CountryCatalog}.
 *
 * Methods:
 * - {@link next}: Returns the next country in the queue
 * - {@link requeue}: Resets the queue
 * - {@link blacklist}: Prevents a country from reselection and removes it from the queue
 */
export class CountryQueue implements ICountryQueue {
  #continent: string;
  #countryCatalog: CountryCatalog;
  #queue: string[];
  #countryBlacklist: string[] = [];
  #canAutoRequeue = true;

  constructor({ catalog, continent }: CountryQueueArgs, properties: CountryQueueProperties = { autoRequeue: true }) {
    this.#continent = continent;
    this.#countryCatalog = catalog;

    if (properties) {
      if (properties.autoRequeue !== undefined) this.#canAutoRequeue = properties.autoRequeue;
    }

    this.#queue = this.#countryCatalog.getCountriesIn(this.#continent, true);
  }

  get length() {
    return this.#queue.length;
  }

  get blacklisted() {
    return this.#countryBlacklist;
  }

  requeue() {
    if (!this.#continent) return;

    const features = this.#countryCatalog.getCountriesIn(this.#continent, true);
    this.#queue = features.filter((c) => !this.#countryBlacklist.includes(c));
  }

  /**
   *
   * @returns The next country in the queue
   */
  next() {
    // Reset the queue if needed
    if (this.#queue.length === 0 && this.#canAutoRequeue) this.requeue();

    // Get the next country
    return this.#queue.pop();
  }

  /**
   * Checks if a country is in the queue.
   */
  includes(country: string) {
    return this.#queue.includes(country);
  }

  #removeFromStack(country: string) {
    if (!this.#queue) return 0;

    const filtered = this.#queue.filter((c) => c !== country);
    const removedCount = this.#queue.length - filtered.length;

    this.#queue = filtered;

    return removedCount;
  }

  /**
   * Prevents a country from reselection and removes it from the queue.
   * @param country
   */
  blacklist(country: string) {
    // Remove the country from the current stack
    this.#removeFromStack(country);
    // Prevent it from being selected again
    this.#countryBlacklist.push(country);
  }

  /**
   * Prevents countries from reselection and removes them from the queue.
   * @param countries A list of country codes
   */
  blacklistMany(countries: string[]) {
    for (const country of countries) {
      this.blacklist(country);
    }
  }

  hasBlacklisted(country: string) {
    return this.#countryBlacklist.includes(country);
  }
}
