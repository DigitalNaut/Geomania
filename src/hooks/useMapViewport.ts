import type { LatLngExpression } from "leaflet";

import { useMapContext } from "src/contexts/MapContext";

export function useMapViewport() {
  const { map, defaults } = useMapContext();

  function flyTo(
    destination: LatLngExpression | null,
    { zoom = 5, animate = true, duration = 0.1 } = {},
  ) {
    if (!destination) return;

    map?.flyTo(destination, zoom, {
      animate,
      duration,
    });
  }

  function resetView() {
    map?.setView(defaults.center, defaults.zoom);
  }

  return { flyTo, resetView };
}
