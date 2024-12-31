import type { PropsWithChildren } from "react";
import { useState } from "react";

import { CountryStoreContext } from "./useCountryStoreContext";
import type { NullableCountryData } from "src/types/features";

export function CountryStoreProvider({ children }: PropsWithChildren) {
  const [storedCountry, setStoredCountry] = useState<NullableCountryData>(null);

  return (
    <CountryStoreContext
      value={{
        storedCountry,
        setStoredCountry,
      }}
    >
      {children}
    </CountryStoreContext>
  );
}
