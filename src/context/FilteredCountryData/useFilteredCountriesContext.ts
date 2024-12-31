import { useContext } from "react";

import { FilteredCountryDataContext } from "./FilteredCountryDataContext";

export function useFilteredCountriesContext() {
  const context = useContext(FilteredCountryDataContext);
  if (!context) throw new Error("useCountryFiltersContext must be used within a CountryFiltersProvider");

  return context;
}
