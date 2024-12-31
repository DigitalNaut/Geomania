import allFeaturesData from "src/assets/data/features/countries.json";
import type { CountryDataList, CountryData } from "src/types/features";

/**
 * Countries ordered by continent Map<string, CountryData[]>
 */
export const countryDataByContinent = allFeaturesData.reduce((continents, country) => {
  const { CONTINENT: continent } = country;

  if (!continents.has(continent)) continents.set(continent, []);

  const group = continents.get(continent)!;
  group.push(country);

  return continents;
}, new Map<string, CountryDataList>());

export const continents = [...countryDataByContinent.keys()];
export const initialContinentFilters = new Map(continents.map((continent) => [continent, false]));
export const optimizedAllFeaturesData: Map<string, CountryData> = new Map(
  allFeaturesData.map((country) => [country.GU_A3, country]),
);
