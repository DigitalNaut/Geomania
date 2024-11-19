import type { LatLngExpression, ZoomPanOptions } from "leaflet";
import { useEffect } from "react";

import { mapDefaults } from "src/components/map/LeafletMapFrame/defaults";
import { useUserSettingsContext } from "src/hooks/useUserSettings";
import { useMapContext } from "./useMapContext";

type options = {
  padding: number;
};

export function useMapViewport({ options }: { options?: options } = {}) {
  const { map } = useMapContext();
  const { userSettings } = useUserSettingsContext();
  const padding = options?.padding ?? 0.5;

  useEffect(() => {
    if (!map || !padding) return;

    const adjustedBounds = map?.getBounds().pad(padding);

    map.setMaxBounds(adjustedBounds);
  }, [map, padding]);

  async function flyTo(
    destination: LatLngExpression | null,
    { zoom = 4, animate = true, duration = userSettings.reducedMotion ? 0.1 : 0.25 } = {},
    delay = 0,
  ) {
    if (!map || !destination) return;

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    map.flyTo(destination, zoom, {
      animate,
      duration,
    });
  }

  function resetView(options?: ZoomPanOptions) {
    if (!map) return;
    map.setView(mapDefaults.center, mapDefaults.zoom, options);
  }

  return { flyTo, resetView };
}
