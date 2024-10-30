import allFeaturesData from "src/assets/data/features/countries.json";
import type { CountryDataList } from "src/types/features";

// Reorganizes all countries by continent
export const countryDataByContinent = allFeaturesData.reduce((continents, country) => {
  const { CONTINENT: continent } = country;

  if (!continents.has(continent)) continents.set(continent, []);

  const group = continents.get(continent)!;
  group.push(country);

  return continents;
}, new Map<string, CountryDataList>());

export const continents = [...countryDataByContinent.keys()];
