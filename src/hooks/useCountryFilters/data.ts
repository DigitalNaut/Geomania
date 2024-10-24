import allFeaturesData from "src/assets/data/country-features.json";
import type { CountryDataList } from "src/hooks/useCountryStore/types";

export const countryDataByContinent = allFeaturesData.reduce((groups, country) => {
  const { CONTINENT: continent } = country;

  if (!groups.has(continent)) groups.set(continent, []);

  const group = groups.get(continent)!;

  group.push(country);

  return groups;
}, new Map<string, CountryDataList>());

export const continents = [...countryDataByContinent.keys()];
