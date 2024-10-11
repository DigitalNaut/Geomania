import { createContext, useContext } from "react";

import type { MapActivityContext } from "./types";

const MapActivityContext = createContext<MapActivityContext | null>(null);

export const Provider = MapActivityContext.Provider;

export function useMapActivity() {
  const context = useContext(MapActivityContext);
  if (!context) throw new Error("useMapActivityContext must be used within a MapActivityProvider");

  return context;
}

export { MapActivityProvider } from "./Provider";
