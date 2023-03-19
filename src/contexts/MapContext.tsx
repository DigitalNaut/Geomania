import type { Dispatch, SetStateAction, PropsWithChildren } from "react";
import type { LatLngTuple, Map } from "leaflet";
import type { LatLngExpression } from "leaflet";
import { createContext, useContext, useState } from "react";

type MapContext = {
  map: Map | null;
  setMap: Dispatch<SetStateAction<Map | null>>;
  defaults: {
    center: LatLngExpression;
    zoom: number;
  };
};

const defaults = {
  center: [0, 0] as LatLngTuple,
  zoom: 1.5,
};

const MapContext = createContext<MapContext>({
  map: null,
  setMap: () => null,
  defaults,
});

/**
 * Map Context Provider
 * Holds the map instance and the data for the current country
 */
export default function MapContextProvider({ children }: PropsWithChildren) {
  const [map, setMap] = useState<MapContext["map"]>(null);

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        defaults,
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
