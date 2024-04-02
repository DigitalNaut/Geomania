import { useEffect, type PropsWithChildren, type ComponentProps } from "react";
import { MapContainer as LeafletMapContainer, useMapEvents } from "react-leaflet";
import { icon } from "leaflet";

import type { Required } from "src/types/utility";
import { useMapContext } from "src/contexts/MapContext";
import { TileLayersControl } from "./TileLayersControl";
import "leaflet/dist/leaflet.css";

// * On Styling layers: https://leafletjs.com/examples/choropleth/
// * On Markers: https://codesandbox.io/s/react-leaflet-v3-x-geojson-with-typescript-not-rendering-geojson-points-v28ly?file=/src/Map.tsx

export const mapDefaults: Required<
  ComponentProps<typeof LeafletMapContainer>,
  "center" | "zoom" | "minZoom" | "maxZoom" | "zoomControl" | "maxBoundsViscosity"
> = {
  center: [0, 0],
  zoom: 2,
  minZoom: 2,
  maxZoom: 7,
  zoomControl: false,
  maxBoundsViscosity: 0.5,
} as const;

function MapEvents() {
  const { setMap, setZoom } = useMapContext();
  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  useEffect(() => {
    setMap(map);
  }, [map, setMap]);

  return null;
}

type Props = PropsWithChildren<{
  showTileLayers?: boolean;
}>;

export function LeafletMap({ children, showTileLayers }: Props) {
  return (
    <LeafletMapContainer
      className="bg-gradient-to-br from-sky-700 to-sky-800"
      {...mapDefaults}
      style={{ width: "100%", height: "100%" }}
    >
      <MapEvents />
      {children}
      {showTileLayers && <TileLayersControl />}
    </LeafletMapContainer>
  );
}

export const markerIcon = icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
});
