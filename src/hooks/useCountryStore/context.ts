import { type Dispatch, type SetStateAction, createContext } from "react";

import type { NullableCountryData } from "src/types/features";

type CountryStoreContextType = {
  storedCountry: NullableCountryData;
  setStoredCountry: Dispatch<SetStateAction<NullableCountryData>>;
};

export const countryStoreContext = createContext<CountryStoreContextType | null>(null);

export const Provider = countryStoreContext.Provider;
