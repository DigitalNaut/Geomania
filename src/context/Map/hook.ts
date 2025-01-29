import type { Map } from "leaflet";
import type { Dispatch, SetStateAction } from "react";
import { createContext, useContext } from "react";

export type MapContextType = {
  map?: Map;
  setMap: Dispatch<SetStateAction<Map | undefined>>;
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
};

export const MapContext = createContext<MapContextType | null>(null);

export function useMapContext() {
  const context = useContext(MapContext);

  if (!context) throw new Error("'useMapContext' must be used within a 'MapContextProvider'");

  return context;
}

export { MapContextProvider } from ".";
