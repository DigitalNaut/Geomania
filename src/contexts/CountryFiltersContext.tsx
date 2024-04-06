import { type PropsWithChildren, createContext, useContext, useMemo, useState, useCallback } from "react";

import { type CountryDataList } from "src/hooks/useCountryStore";
import allFeaturesData from "src/assets/data/features-data.json";

const countryDataByContinent = allFeaturesData.reduce(
  (groups, country) => {
    const { CONTINENT: continent } = country;

    groups[continent] ??= [];
    groups[continent].push(country);

    return groups;
  },
  {} as Record<string, CountryDataList>,
);

export const continents = Object.keys(countryDataByContinent);

const initialContinentFilters = Object.fromEntries(continents.map((continent) => [continent, true]));

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

  const isCountryInFilters = useCallback(
    (a3: string) => {
      const country = allFeaturesData.find((country) => country.GU_A3 === a3);
      if (!country) return false;

      const { CONTINENT: continent } = country;

      if (!continent) return false;

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
    isCountryInFilters,
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
