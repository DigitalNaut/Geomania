import type { Dispatch, SetStateAction, PropsWithChildren } from "react";
import type { Map } from "leaflet";
import type { CountryData } from "src/controllers/MapController";

import { createContext, useContext, useState } from "react";

type MapContext = {
  map: Map | null;
  setMap: Dispatch<SetStateAction<Map | null>>;
  storedCountry: CountryData;
  setStoredCountry: Dispatch<SetStateAction<CountryData>>;
};

const MapContext = createContext<MapContext>({
  map: null,
  setMap: () => null,
  storedCountry: null,
  setStoredCountry: () => null,
});

/**
 * Map Context Provider
 * Holds the map instance and the data for the current country
 */
export default function MapContextProvider({ children }: PropsWithChildren) {
  const [map, setMap] = useState<MapContext["map"]>(null);
  const [storedCountry, setStoredCountry] =
    useState<MapContext["storedCountry"]>(null);

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        storedCountry,
        setStoredCountry,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context)
    throw new Error("useMapContext must be used within a MapContextProvider");

  return context;
}
