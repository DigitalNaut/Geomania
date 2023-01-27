import type { Dispatch, SetStateAction, PropsWithChildren } from 'react';
import type { Map } from 'leaflet';
import type { CountryData } from 'src/controllers/MapController';

import { createContext, useContext, useState } from 'react';

type MapContext = {
  map: Map | null;
  setMap: Dispatch<SetStateAction<Map | null>>;
  countryData?: CountryData;
  setCountryData: Dispatch<SetStateAction<CountryData | undefined>>;
};

const MapContext = createContext<MapContext>({
  map: null,
  setMap: () => null,
  countryData: undefined,
  setCountryData: () => null,
});

/**
 * Map Context Provider
 * Holds the map instance and the data for the current country
 */
export default function MapContextProvider({ children }: PropsWithChildren) {
  const [map, setMap] = useState<MapContext['map']>(null);
  const [countryData, setCountryData] = useState<MapContext['countryData']>();

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        countryData,
        setCountryData,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context)
    throw new Error('useMapContext must be used within a MapContextProvider');

  return context;
}
