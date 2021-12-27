import React, { createContext, useContext, useState } from 'react';
import Leaflet from 'leaflet';

import { CountryDataType } from './MapController';

export type MapContextType = {
  map?: Leaflet.Map;
  setMap?: React.Dispatch<React.SetStateAction<Leaflet.Map | undefined>>;
  countryData?: CountryDataType;
  setCountryData?: React.Dispatch<React.SetStateAction<CountryDataType | undefined>>;
};
const MapContext = createContext<MapContextType>({});

const MapContextProvider: React.FC = ({ children }) => {
  const [map, setMap] = useState<Leaflet.Map>();
  const [countryData, setCountryData] = useState<CountryDataType>();

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
  return useContext(MapContext);
}

export default MapContextProvider;
