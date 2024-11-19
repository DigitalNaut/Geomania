import { createContext, useCallback, useContext, useMemo, useState } from "react";

import allFeaturesData from "src/assets/data/features/countries.json";
import type { CountryData } from "src/types/features";
import { continents, countryDataByContinent } from "./data";

const initialContinentFilters = new Map(continents.map((continent) => [continent, false]));

const optimizedAllFeaturesData: Map<string, CountryData> = new Map(
  allFeaturesData.map((country) => [country.GU_A3, country]),
);

export function useFilteredCountryData() {
  const [continentFilters, setContinentFilters] = useState(initialContinentFilters);

  const filteredCountryData = useMemo(
    () =>
      allFeaturesData.filter((country) => {
        const continent = country.CONTINENT;
        return continent.length && continentFilters.get(continent);
      }),
    [continentFilters],
  );

  const toggleContinentFilter = (continent: string, toggle: boolean) => {
    setContinentFilters((currentFilters) => new Map(currentFilters.set(continent, toggle)));
  };

  const toggleAllContinentFilters = (value: boolean) => {
    continents.forEach((continent) => {
      toggleContinentFilter(continent, value);
    });
  };

  const getContinentFilter = useCallback(
    (continent: string) => continentFilters.get(continent) ?? false,
    [continentFilters],
  );

  const isCountryInFilters = useCallback(
    (targetA3: string) => {
      const country = optimizedAllFeaturesData.get(targetA3);

      if (!country) return false;

      return getContinentFilter(country.CONTINENT);
    },
    [getContinentFilter],
  );

  const continentFiltersList = useMemo(() => [...continentFilters], [continentFilters]);

  return {
    toggleAllContinentFilters,
    toggleContinentFilter,
    getContinentFilter,
    continentFiltersList,
    countryDataByContinent,
    filteredCountryData,
    isCountryInFilters,
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
