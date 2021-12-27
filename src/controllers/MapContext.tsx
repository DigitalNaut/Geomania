import React, { createContext, useContext, useState, useMemo } from 'react';
import Leaflet from 'leaflet';

import { CountryDataType } from 'src/controllers/MapController';

export type MapContextType = {
  map?: Leaflet.Map;
  setMap?: React.Dispatch<React.SetStateAction<Leaflet.Map | undefined>>;
  countryData?: CountryDataType;
  setCountryData?: React.Dispatch<React.SetStateAction<CountryDataType | undefined>>;
  countryCoords?: Leaflet.LatLngTuple | null;
};
const MapContext = createContext<MapContextType>({});

const MapContextProvider: React.FC = ({ children }) => {
  const [map, setMap] = useState<Leaflet.Map>();
  const [countryData, setCountryData] = useState<CountryDataType>();

  const countryCoords: Leaflet.LatLngTuple | null = useMemo(
    () => (countryData ? [countryData.latitude, countryData.longitude] : null),
    [countryData],
  );

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        countryData,
        setCountryData,
        countryCoords,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export function useMapContext() {
  return useContext(MapContext);
}

export default MapContextProvider;
