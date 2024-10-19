import type { PropsWithChildren } from "react";
import { useState } from "react";

import { Provider } from "./context";
import type { NullableCountryData } from "./types";

export function CountryStoreProvider({ children }: PropsWithChildren) {
  const [storedCountry, setStoredCountry] = useState<NullableCountryData>(null);

  return (
    <Provider
      value={{
        storedCountry,
        setStoredCountry,
      }}
    >
      {children}
    </Provider>
  );
}