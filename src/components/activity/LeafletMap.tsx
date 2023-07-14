import { useMemo, type PropsWithChildren } from "react";
import Leaflet from "leaflet";
import { MapContainer } from "react-leaflet";
// import { GeoJsonObject } from 'geojson';

import { useMapContext } from "src/contexts/MapContext";

import "leaflet/dist/leaflet.css";

// * On Styling layers: https://leafletjs.com/examples/choropleth/
// * On Markers: https://codesandbox.io/s/react-leaflet-v3-x-geojson-with-typescript-not-rendering-geojson-points-v28ly?file=/src/Map.tsx

export function LeafletMap({ children }: PropsWithChildren) {
  const { setMap, map } = useMapContext();
  const bounds = useMemo(() => map?.getBounds(), [map]);

  return (
    <MapContainer
      className="bg-gradient-to-br from-sky-700 to-sky-800"
      center={bounds?.getCenter() || [0, 0]}
      zoom={1.5}
      zoomControl={false}
      bounds={bounds}
      maxBounds={bounds}
      maxBoundsViscosity={1.0}
      style={{ width: "100%", height: "100%" }}
      ref={setMap}
      minZoom={2}
      maxZoom={6}
    >
      {children}
    </MapContainer>
  );
}

export const markerIcon = Leaflet.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
});
