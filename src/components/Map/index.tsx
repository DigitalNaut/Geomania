import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import Leaflet, { PathOptions } from 'leaflet';
import { GeoJsonObject } from 'geojson';

import { MAPBOX_TILEMAP_URL, OSM_TILEMAP_URL } from 'src/resources';
import colors from 'tailwindcss/colors';

// * On Styling layers: https://leafletjs.com/examples/choropleth/
// * On Markers: https://codesandbox.io/s/react-leaflet-v3-x-geojson-with-typescript-not-rendering-geojson-points-v28ly?file=/src/Map.tsx

// Properties

const lopLeftCorner = Leaflet.latLng(-90, -250);
const bottomRightCorner = Leaflet.latLng(90, 250);
const maxBounds = Leaflet.latLngBounds(lopLeftCorner, bottomRightCorner);
const isUseMapbox = false;

const countryStyle: PathOptions = {
  fillColor: colors.blue[600],
  fillOpacity: 1,
  color: colors.gray[300],
  weight: 1,
  interactive: false,
};

export async function loadCountryGeometry(): Promise<GeoJsonObject> {
  const data = (await import('src/data/continent-africa.json')) as GeoJsonObject;
  console.log('Geometry JSON:', data.type);

  return new Promise((resolve, reject) => {
    if (data) resolve(data);
    else reject(new Error());
  });
}

// Viewport

const Map: React.FC = ({ children }) => {
  const [countryGeometry, setCountryGeometry] = useState<GeoJsonObject>();

  useEffect(() => {
    async function getGeometry() {
      const geometry = await loadCountryGeometry();
      setCountryGeometry(geometry);
    }
    getGeometry();
  }, []);

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
      {countryGeometry && <GeoJSON data={countryGeometry} style={countryStyle} />}
      {children}
    </MapContainer>
  );
};

export default Map;
