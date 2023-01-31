import { useMapEvents } from "react-leaflet";

/**
 * A React Leaflet component that listens for map clicks.
 */
export function MapClick({ callback: callback }: { callback?: () => void }) {
  useMapEvents({
    click: () => callback?.(),
  });

  return null;
}
