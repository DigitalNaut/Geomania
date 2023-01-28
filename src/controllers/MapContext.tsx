import type { Dispatch, SetStateAction, PropsWithChildren } from 'react';
import type { Map } from 'leaflet';
import type { CountryData } from 'src/controllers/MapController';

import { createContext, useContext, useState } from 'react';

type MapContext = {
  map: Map | null;
  setMap: Dispatch<SetStateAction<Map | null>>;
  countryAnswerData: CountryData;
  setCountryAnswerData: Dispatch<SetStateAction<CountryData>>;
};

const MapContext = createContext<MapContext>({
  map: null,
  setMap: () => null,
  countryAnswerData: null,
  setCountryAnswerData: () => null,
});

/**
 * Map Context Provider
 * Holds the map instance and the data for the current country
 */
export default function MapContextProvider({ children }: PropsWithChildren) {
  const [map, setMap] = useState<MapContext['map']>(null);
  const [countryAnswerData, setCountryAnswerData] = useState<MapContext['countryAnswerData']>(null);

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        countryAnswerData,
        setCountryAnswerData,
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
