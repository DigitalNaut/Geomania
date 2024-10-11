import { useContext } from "react";

import { countryStoreContext } from "./context";

export function useCountryStoreContext() {
  const context = useContext(countryStoreContext);
  if (!context) throw new Error("useCountryStore must be used within a CountryStoreProvider");

  return context;
}
