import type countryData from "src/assets/data/features/countries.json";

export type CountryFeatures = typeof countryData;
export type CountryData = CountryFeatures[number];
export type CountryCatalog = Record<string, CountryData>;
export type ContinentCatalog = Record<string, string[]>;
