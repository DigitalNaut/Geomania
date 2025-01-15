export interface ICountryCatalog {
  continents: string[];
  getCountriesIn(continent: string): string[];
  includes(continent: string): boolean;
}

export interface ICountryQueue {
  length: number;
  next(): string | undefined;
  includes(country: string): boolean;
  requeue(): void;
}
