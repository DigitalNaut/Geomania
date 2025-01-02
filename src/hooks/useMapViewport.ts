import type { LatLngExpression, ZoomPanOptions } from "leaflet";
import { useEffect } from "react";

import { mapDefaults } from "src/components/map/LeafletMapFrame/defaults";
import { useMapContext } from "./useMapContext";
import { useSettings } from "./useSettings";

type Options = {
  padding: number;
};

/**
 * Manages the map viewport.
 *
 * Provides a function to fly to a new location on the map.
 *
 * @param {Object} [Options]
 * @param {number} [Options.padding] - The amount of padding to add to the adjusted bounds.
 * @returns {Object} An object with a single key, `flyTo`, which is a function.
 */
export function useMapViewport({ options }: { options?: Options } = {}) {
  const { useReducedMotion } = useSettings();
  const { map } = useMapContext();
  const padding = options?.padding ?? 0.5;

  useEffect(() => {
    if (!map || !padding) return;

    const adjustedBounds = map?.getBounds().pad(padding);

    map.setMaxBounds(adjustedBounds);
  }, [map, padding]);

  async function flyTo(
    destination: LatLngExpression | null,
    { zoom = 4, animate = true, duration = useReducedMotion ? 0.05 : 0.25 } = {},
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

  function resetViewport(options?: ZoomPanOptions) {
    if (!map) return;
    map.setView(mapDefaults.center, mapDefaults.zoom, options);
  }

  return { flyTo, resetViewport };
}
