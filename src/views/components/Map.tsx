import React from 'react';
import { MapContainer, GeoJSON, TileLayer } from 'react-leaflet';
import { GeoJsonObject, Feature, Geometry } from 'geojson';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import countries from 'src/data/country-markers.json';

// * https://codesandbox.io/s/react-leaflet-v3-x-geojson-with-typescript-not-rendering-geojson-points-v28ly?file=/src/Map.tsx

L.Marker.prototype.options.icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
});

const center = { lat: 59.433421, lng: 24.75224 };

export default function Map() {
  const onEachFeature = (feature: Feature<Geometry, { popupContent: string }>, layer: L.Layer) => {
    if (feature.properties) {
      const { popupContent } = feature.properties;
      layer.bindPopup(popupContent);
    }
  };
  return (
    <MapContainer style={{ height: '100vh', width: '100vw' }} center={center} zoom={2}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* <Marker position={[59.43046, 24.728563]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker> */}
      <GeoJSON data={countries as GeoJsonObject} onEachFeature={onEachFeature} />
    </MapContainer>
  );
}
