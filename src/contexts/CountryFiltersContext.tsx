import { type PropsWithChildren, createContext, useContext, useMemo, useState } from "react";

import { type CountryDataList } from "src/hooks/useCountryStore";
import continents from "src/assets/data/continents.json";
import countriesMetadata from "src/assets/data/country-metadata.json";

type CountriesDataByContinent = Record<string, CountryDataList>;
export type CountryFilters = Record<string, boolean>;

const allCountriesMetadata = countriesMetadata as CountryDataList;

const countryDataByContinent = allCountriesMetadata.reduce((groups, country) => {
  const { cont: continent } = country;

  if (groups[continent]) groups[continent].push(country);
  else groups[continent] = [country];

  return groups;
}, {} as CountriesDataByContinent);

const initialContinentFilters = continents.reduce((continents, continent) => {
  continents[continent] = true;
  return continents;
}, {} as CountryFilters);

function useFilteredCountryData() {
  const [continentFilters, setContinentFilters] = useState(initialContinentFilters);

  const filteredCountryData = useMemo(
    () =>
      allCountriesMetadata.filter((country) => {
        const { cont: continent } = country || {};
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

  const isCountryInFilters = (a3: string) => {
    const country = allCountriesMetadata.find((country) => country.a3 === a3);
    if (!country) return false;

    const { cont: continent } = country;
    return continent && continentFilters[continent];
  };

  return {
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
