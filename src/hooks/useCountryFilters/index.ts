import { createContext, useCallback, useContext, useMemo, useState } from "react";

import allFeaturesData from "src/assets/data/country-features.json";
import type { CountryData } from "src/hooks/useCountryStore/types";
import { continents, countryDataByContinent } from "./data";

const initialContinentFilters = Object.fromEntries(continents.map((continent) => [continent, false]));

export type CountryFilters = typeof initialContinentFilters;

const optimizedAllFeaturesData: Map<string, CountryData> = new Map(
  allFeaturesData.map((country) => [country.GU_A3, country]),
);

export function useFilteredCountryData() {
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

export const Provider = filteredCountryDataContext.Provider;

export function useCountryFilters() {
  const context = useContext(filteredCountryDataContext);
  if (!context) throw new Error("useCountryFiltersContext must be used within a CountryFiltersProvider");

  return context;
}

export { CountryFiltersProvider } from "./Provider";
