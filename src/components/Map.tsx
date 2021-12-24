import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import Leaflet from 'leaflet';

import countries from 'src/data/country-metadata.json';

// * Styling layers: https://leafletjs.com/examples/choropleth/
// * Markers: https://codesandbox.io/s/react-leaflet-v3-x-geojson-with-typescript-not-rendering-geojson-points-v28ly?file=/src/Map.tsx

const markerIcon = Leaflet.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
});

const lopLeftCorner = Leaflet.latLng(-90, -200);
const bottomRightCorner = Leaflet.latLng(90, 200);
const maxBounds = Leaflet.latLngBounds(lopLeftCorner, bottomRightCorner);

export default function Map() {
  return (
    <MapContainer
      style={{ height: '100vh', width: '100vw' }}
      center={maxBounds.getCenter()}
      zoom={1.5}
      maxBounds={maxBounds}
      maxBoundsViscosity={1.0}
      className="shadow-inner"
    >
      <TileLayer
        attribution="&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>"
        url={`https://api.mapbox.com/styles/v1/${process.env.REACT_APP_MAPBOX_USER}/${process.env.REACT_APP_MAPBOX_MAP_STYLE}/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_DEV_PK}`}
      />
      {/* <GeoJSON data={countries as GeoJsonObject} onEachFeature={onEachFeature} /> */}
      {countries.map((country) => {
        const coordinates: Leaflet.LatLngExpression = [
          Number(country.Latitude),
          Number(country.Longitude),
        ];
        return <Marker key={coordinates.toString()} position={coordinates} icon={markerIcon} />;
      })}
    </MapContainer>
  );
}
