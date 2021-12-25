import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import Leaflet from 'leaflet';

import Input from 'src/components/Map/Input';
import CountryVisitorCtrl, { CountryDataType } from 'src/controllers/MapController';
import { MAPBOX_TILEMAP_URL, OSM_TILEMAP_URL } from 'src/resources';

// * Styling layers: https://leafletjs.com/examples/choropleth/
// * Markers: https://codesandbox.io/s/react-leaflet-v3-x-geojson-with-typescript-not-rendering-geojson-points-v28ly?file=/src/Map.tsx

// Properties

const lopLeftCorner = Leaflet.latLng(-90, -250);
const bottomRightCorner = Leaflet.latLng(90, 250);
const maxBounds = Leaflet.latLngBounds(lopLeftCorner, bottomRightCorner);
const isUseMapbox = false;

// Viewport

export default function Map() {
  const [countryData, setCountryData] = useState<CountryDataType>();

  return (
    <MapContainer
      center={maxBounds.getCenter()}
      zoom={1.5}
      maxBounds={maxBounds}
      maxBoundsViscosity={1.0}
      className="w-full h-full shadow-inner"
    >
      <TileLayer
        className=""
        attribution="&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>"
        url={isUseMapbox ? MAPBOX_TILEMAP_URL : OSM_TILEMAP_URL}
      />
      {countryData && (
        <Input position={[countryData.latitude, countryData.longitude]} text={countryData.name} />
      )}
      <CountryVisitorCtrl callback={setCountryData} />
    </MapContainer>
  );
}
