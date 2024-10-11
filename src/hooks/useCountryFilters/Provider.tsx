import type { PropsWithChildren } from "react";

import { Provider, useFilteredCountryData } from ".";

export function CountryFiltersProvider({ children }: PropsWithChildren) {
  const filteredCountryData = useFilteredCountryData();

  return <Provider value={filteredCountryData}>{children}</Provider>;
}
