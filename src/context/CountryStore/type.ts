import { type Dispatch, type SetStateAction } from "react";

import type { NullableCountryData } from "src/types/features";

export interface CountryStoreContextValue {
  storedCountry: NullableCountryData;
  setStoredCountry: Dispatch<SetStateAction<NullableCountryData>>;
}
