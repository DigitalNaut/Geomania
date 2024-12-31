import { type Dispatch, type SetStateAction, createContext, useContext } from "react";

import type { NullableCountryData } from "src/types/features";

interface CountryStoreContextValue {
  storedCountry: NullableCountryData;
  setStoredCountry: Dispatch<SetStateAction<NullableCountryData>>;
}

export const CountryStoreContext = createContext<CountryStoreContextValue | null>(null);

export function useCountryStoreContext() {
  const context = useContext(CountryStoreContext);
  if (!context) throw new Error("useCountryStore must be used within a CountryStoreProvider");

  return context;
}
