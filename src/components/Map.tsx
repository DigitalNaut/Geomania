import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvent } from 'react-leaflet';
import Leaflet from 'leaflet';

import countries from 'src/data/country-metadata.json';

// * Styling layers: https://leafletjs.com/examples/choropleth/
// * Markers: https://codesandbox.io/s/react-leaflet-v3-x-geojson-with-typescript-not-rendering-geojson-points-v28ly?file=/src/Map.tsx

// const markerIcon = Leaflet.icon({
//   iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
//   iconSize: [25, 41],
//   iconAnchor: [12.5, 41],
// });

const lopLeftCorner = Leaflet.latLng(-90, -200);
const bottomRightCorner = Leaflet.latLng(90, 200);
const maxBounds = Leaflet.latLngBounds(lopLeftCorner, bottomRightCorner);

type CustomMarkerProps = {
  position: Leaflet.LatLngTuple;
  text: string;
};

const nameExp = /^(.+), (.+)$/;
function fixName(text: string) {
  const matches = nameExp.exec(text);
  if (matches && matches.length > 1) return `${matches[2]} ${matches[1]}`;
  return text;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ position, text }) => {
  let className = `p-2 text-white bg-gray-900 rounded-sm drop-shadow outline outline-1 outline-gray-800`;
  const html = document.createElement('div');
  html.innerText = fixName(text);
  html.className = className;

  className = 'flex justify-center w-0 h-0 text-center place-items-center';
  const icon = Leaflet.divIcon({
    html,
    className,
  });

  return <Marker position={position} icon={icon} />;
};

function RandomCountryVisitor() {
  const map = useMapEvent('click', () => {
    const randomCountryIndex = Math.floor(Math.random() * countries.length);
    const randomCountry = countries[randomCountryIndex];
    const countryCoords: Leaflet.LatLngTuple = [
      Number(randomCountry.latitude),
      Number(randomCountry.longitude),
    ];

    map.setZoom(8).flyTo(countryCoords);
  });

  return null;
}

export default function Map() {
  const countryMarkers = countries.map((country) => {
    const coordinates: Leaflet.LatLngTuple = [Number(country.latitude), Number(country.longitude)];

    return <CustomMarker key={coordinates.toString()} position={coordinates} text={country.name} />;
  });

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
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // url={`https://api.mapbox.com/styles/v1/${process.env.REACT_APP_MAPBOX_USER}/${process.env.REACT_APP_MAPBOX_MAP_SATELLITE_STYLE}/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_DEV_PK}`}
      />
      {countryMarkers}
      <RandomCountryVisitor />
    </MapContainer>
  );
}
