import { createContext } from "react";

import type { CountryDataList } from "src/types/features";

interface FilteredCountryDataContext {
  toggleAllContinentFilters: (value: boolean) => void;
  toggleContinentFilter: (continent: string, toggle: boolean) => void;
  getContinentFilter: (continent: string) => boolean;
  continentFiltersList: [continent: string, checked: boolean][];
  countryDataByContinent: Map<string, CountryDataList>;
  filteredCountryData: CountryDataList;
  isCountryInFilters: (targetA3: string) => boolean;
}

export const FilteredCountryDataContext = createContext<FilteredCountryDataContext | null>(null);
