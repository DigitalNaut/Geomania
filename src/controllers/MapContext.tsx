import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
  FC,
} from 'react';
import Leaflet, { Map } from 'leaflet';

import { CountryDataType } from 'src/controllers/MapController';

type IMap = Map | undefined;
type ICountry = CountryDataType | undefined;

type MapContextType = {
  map: IMap;
  setMap: Dispatch<SetStateAction<IMap>>;
  countryData: ICountry;
  setCountryData: Dispatch<SetStateAction<ICountry>>;
  countryCoords?: Leaflet.LatLngTuple;
};

const MapContext = createContext<MapContextType>({} as MapContextType);

const MapContextProvider: FC = ({ children }) => {
  const [map, setMap] = useState<MapContextType['map']>();
  const [countryData, setCountryData] = useState<MapContextType['countryData']>();

  const countryCoords: MapContextType['countryCoords'] = useMemo(
    () => (countryData ? [countryData.latitude, countryData.longitude] : undefined),
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
