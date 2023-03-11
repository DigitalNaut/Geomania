import type { LatLngExpression } from "leaflet";

import { useMapContext } from "src/contexts/MapContext";

export function useMapControl({ zoom = 5, animate = true, duration = 0.1 }) {
  const { map } = useMapContext();

  function flyTo(destination: LatLngExpression | null) {
    if (!destination) return;

    map?.flyTo(destination, zoom, {
      animate,
      duration,
    });
  }

  function resetView() {
    map?.setView([0, 0], 2);
  }

  return { flyTo, resetView };
}
