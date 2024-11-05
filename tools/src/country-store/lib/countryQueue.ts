import { ContinentCatalog, ContinentName } from "../types.js";
import { getContinentFeatures } from "./continents.js";

type CountryQueueProperties = {
  /** Whether to reset the queue if there are no more countries left. */
  autoRequeue: true;
};

export class CountryQueue {
  continent: string;
  catalog: ContinentCatalog;
  countryStack: string[] | null;
  countryBlacklist: string[] = [];
  canAutoRequeue = true;

  constructor(continent: ContinentName, catalog: ContinentCatalog, properties?: CountryQueueProperties) {
    this.continent = continent;
    this.catalog = catalog;

    if (properties) {
      this.canAutoRequeue = properties.autoRequeue;
    }

    this.countryStack = getContinentFeatures(this.continent, this.catalog, true);
  }

  requeue() {
    if (!this.catalog || !this.continent) return;

    const features = getContinentFeatures(this.continent, this.catalog, true);
    if (!features) return;

    this.countryStack = features.filter((c) => !this.countryBlacklist.includes(c));
  }

  next() {
    if (!this.countryStack) return null;
    if (!this.countryStack.length && this.canAutoRequeue) this.requeue();

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
