import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { useEffect } from "react";

import { useMapContext } from "src/context/Map/hook";
import { useSettings } from "./useSettings";

type Options = {
  padding: number;
};

/**
 * Manages the map viewport.
 *
 * Provides a function to fly to a new location on the map.
 *
 * @param Object Same options as `useMapViewport`
 * @param number The amount of padding to add to the adjusted bounds.
 * @returns An object with a single key, `flyTo`, which is a function.
 */
export function useMapViewport({ options }: { options?: Options } = {}) {
  const { useReducedMotion } = useSettings();
  const { map } = useMapContext();
  const padding = options?.padding ?? 0.5;

  useEffect(() => {
    if (!map || !padding) return;

    const paddedBounds = map?.getBounds().pad(padding);

    map.setMaxBounds(paddedBounds);
  }, [map, padding]);

  async function flyTo(
    destination: LatLngExpression | null,
    { zoom = 4, animate = true, duration = useReducedMotion ? 0.05 : 0.25 } = {},
    delayMs = 0,
  ) {
    if (!map || !destination) return;

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    map.flyTo(destination, zoom, {
      animate,
      duration,
    });
  }

  function fitTo(bounds: LatLngBoundsExpression, { animate = true, duration = useReducedMotion ? 0.05 : 0.25 } = {}) {
    if (!map) return;

    map.fitBounds(bounds, { animate, duration });
  }

  function resetViewport() {
    if (!map) return;
    map.fitWorld();
  }

  return { flyTo, fitTo, resetViewport };
}
