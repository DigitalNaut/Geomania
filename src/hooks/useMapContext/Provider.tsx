import type { PropsWithChildren } from "react";
import { useState } from "react";

import { mapDefaults } from "src/components/map/LeafletMapFrame/defaults";
import type { MapContext } from ".";
import { Provider } from ".";

/**
 * Map Context Provider
 * Holds the map instance
 */
export function MapContextProvider({ children }: PropsWithChildren) {
  const [map, setMap] = useState<MapContext["map"]>();
  const [zoom, setZoom] = useState<number>(mapDefaults.zoom);

  return (
    <Provider
      value={{
        map,
        setMap,
        zoom,
        setZoom,
      }}
    >
      {children}
    </Provider>
  );
}
