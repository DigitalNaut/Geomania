import type countryData from "../../../src/assets/data/features/countries.json";

export type CountryFeatures = typeof countryData;
export type CountryData = CountryFeatures[number];
export type ContinentName = CountryData["CONTINENT"];
export type CountryCatalog = Map<string, CountryData>;
export type ContinentCatalog = Map<ContinentName, string[]>;
