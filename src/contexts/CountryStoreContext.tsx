import type { Dispatch, SetStateAction, PropsWithChildren } from "react";
import { useState, createContext, useContext } from "react";

import type { CountryData } from "src/hooks/useCountryStore";

type CountryStoreContextType = {
  storedCountry: CountryData;
  setStoredCountry: Dispatch<SetStateAction<CountryData>>;
};

const countryStoreContext = createContext<CountryStoreContextType>({
  storedCountry: null,
  setStoredCountry: () => null,
});

export default function CountryStoreProvider({ children }: PropsWithChildren) {
  const [storedCountry, setStoredCountry] = useState<CountryData>(null);

  return (
    <countryStoreContext.Provider
      value={{
        storedCountry,
        setStoredCountry,
      }}
    >
      {children}
    </countryStoreContext.Provider>
  );
}

export function useCountryStoreContext() {
  const context = useContext(countryStoreContext);
  if (!context)
    throw new Error(
      "useCountryStore must be used within a CountryStoreProvider"
    );

  return context;
}
