import { type Dispatch, type SetStateAction, type PropsWithChildren, useState, createContext, useContext } from "react";

import type { CountryData } from "src/hooks/useCountryStore";

type CountryStoreContextType = {
  storedCountry: CountryData | null;
  setStoredCountry: Dispatch<SetStateAction<CountryData | null>>;
};

const countryStoreContext = createContext<CountryStoreContextType | null>(null);

export default function CountryStoreProvider({ children }: PropsWithChildren) {
  const [storedCountry, setStoredCountry] = useState<CountryData | null>(null);

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
  if (!context) throw new Error("useCountryStore must be used within a CountryStoreProvider");

  return context;
}
