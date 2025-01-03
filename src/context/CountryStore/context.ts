import { useContext, createContext } from "react";

import type { CountryStoreContextValue } from "./type";

export const CountryStoreContext = createContext<CountryStoreContextValue | null>(null);

export function useCountryStoreContext() {
  const context = useContext(CountryStoreContext);
  if (!context) throw new Error("useCountryStore must be used within a CountryStoreProvider");

  return context;
}
