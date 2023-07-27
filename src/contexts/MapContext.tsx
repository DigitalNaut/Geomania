import { type Dispatch, type SetStateAction, type PropsWithChildren, createContext, useContext, useState } from "react";
import type { Map } from "leaflet";

import { mapDefaults } from "src/components/map/LeafletMap";

type MapContext = {
  map?: Map;
  setMap: Dispatch<SetStateAction<Map | undefined>>;
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
};

const MapContext = createContext<MapContext>({
  setMap: () => null,
  zoom: mapDefaults.zoom,
  setZoom: () => null,
});

/**
 * Map Context Provider
 * Holds the map instance and the data for the current country
 */
export default function MapContextProvider({ children }: PropsWithChildren) {
  const [map, setMap] = useState<MapContext["map"]>();
  const [zoom, setZoom] = useState<number>(mapDefaults.zoom);

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        zoom,
        setZoom,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMapContext must be used within a MapContextProvider");

  return context;
}
