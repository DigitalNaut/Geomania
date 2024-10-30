import { type Dispatch, type SetStateAction, createContext, useContext } from "react";

import type { NullableCountryData } from "src/types/features";

type CountryStoreContextType = {
  storedCountry: NullableCountryData;
  setStoredCountry: Dispatch<SetStateAction<NullableCountryData>>;
};

const countryStoreContext = createContext<CountryStoreContextType | null>(null);

export const Provider = countryStoreContext.Provider;

export function useCountryStoreContext() {
  const context = useContext(countryStoreContext);
  if (!context) throw new Error("useCountryStore must be used within a CountryStoreProvider");

  return context;
}
