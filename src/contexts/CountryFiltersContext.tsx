import { type PropsWithChildren, createContext, useContext, useMemo, useState, useCallback } from "react";

import type { CountryData, CountryDataList } from "src/hooks/useCountryStore";
import allFeaturesData from "src/assets/data/features-data.json";

const countryDataByContinent = allFeaturesData.reduce((groups, country) => {
  const { CONTINENT: continent } = country;

  if (!groups.has(continent)) groups.set(continent, []);

  const group = groups.get(continent)!;

  group.push(country);

  return groups;
}, new Map<string, CountryDataList>());

const optimizedAllFeaturesData: Map<string, CountryData> = new Map(
  allFeaturesData.map((country) => [country.GU_A3, country]),
);

export const continents = [...countryDataByContinent.keys()];

const initialContinentFilters = Object.fromEntries(continents.map((continent) => [continent, false]));

export type CountryFilters = typeof initialContinentFilters;

function useFilteredCountryData() {
  const [continentFilters, setContinentFilters] = useState(initialContinentFilters);

  const filteredCountryData = useMemo(
    () =>
      allFeaturesData.filter((country) => {
        const { CONTINENT: continent } = country ?? {};
        return continent && continentFilters[continent];
      }),
    [continentFilters],
  );

  const toggleContinentFilter = (continent: string, toggle: boolean) => {
    setContinentFilters((currentFilters) => ({
      ...currentFilters,
      [continent]: toggle,
    }));
  };

  const toggleAllContinentFilters = (value: boolean) => {
    continents.forEach((continent) => {
      toggleContinentFilter(continent, value);
    });
  };

  const isCountryInData = useCallback(
    (targetA3: string) => {
      const country = optimizedAllFeaturesData.get(targetA3);

      if (!country) return false;

      const { CONTINENT: continent } = country;

      return continentFilters[continent];
    },
    [continentFilters],
  );

  return {
    toggleAllContinentFilters,
    toggleContinentFilter,
    continentFilters,
    countryDataByContinent,
    filteredCountryData,
    isCountryInData,
  };
}

const filteredCountryDataContext = createContext<ReturnType<typeof useFilteredCountryData> | null>(null);

export default function CountryFiltersProvider({ children }: PropsWithChildren) {
  const filteredCountryData = useFilteredCountryData();

  return (
    <filteredCountryDataContext.Provider value={filteredCountryData}>{children}</filteredCountryDataContext.Provider>
  );
}

export function useCountryFiltersContext() {
  const context = useContext(filteredCountryDataContext);
  if (!context) throw new Error("useCountryFiltersContext must be used within a CountryFiltersProvider");

  return context;
}
