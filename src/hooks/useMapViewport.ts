import type { LatLngExpression } from "leaflet";
import { useEffect } from "react";

import { mapDefaults } from "src/components/activity/map/LeafletMap";
import { useMapContext } from "src/contexts/MapContext";

export function useMapViewport() {
  const { map } = useMapContext();

  useEffect(() => {
    map?.setMaxBounds(map.getBounds());
  }, [map]);

  function flyTo(
    destination: LatLngExpression | null,
    { zoom = 4, animate = true, duration = 0.1 } = {},
  ) {
    if (!destination) return;

    map?.flyTo(destination, zoom, {
      animate,
      duration,
    });
  }

  function resetView() {
    map?.setView(mapDefaults.center, mapDefaults.zoom);
  }

  return { flyTo, resetView };
}
