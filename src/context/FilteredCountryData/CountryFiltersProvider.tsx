import type { PropsWithChildren } from "react";
import { useCallback, useMemo, useState } from "react";

import allFeaturesData from "src/assets/data/features/countries.json";
import { FilteredCountryDataContext } from "./FilteredCountryDataContext";
import { continents, countryDataByContinent, initialContinentFilters, optimizedAllFeaturesData } from "./data";
export function CountryFiltersProvider({ children }: PropsWithChildren) {
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

  return (
    <FilteredCountryDataContext
      value={{
        toggleAllContinentFilters,
        toggleContinentFilter,
        getContinentFilter,
        continentFiltersList,
        countryDataByContinent,
        filteredCountryData,
        isCountryInFilters,
      }}
    >
      {children}
    </FilteredCountryDataContext>
  );
}
