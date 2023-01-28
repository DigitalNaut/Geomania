import type Leaflet from 'leaflet';
import { useMapEvents } from 'react-leaflet';

import type { Feature } from 'geojson';
import countriesMetadata from 'src/data/country-metadata.json';
import countryGeometries from 'src/data/country-geometries.json';

export type CountryData = typeof countriesMetadata[number] | null;

/**
 * Gets the country geometry from the country geometries data.
 * @param alpha3 The country's alpha-3 code.
 * @returns The country geometry.
 */
export function getCountryGeometry(alpha3: string) {
  const feature = countryGeometries["features"].find(
    (feature) => feature["properties"]["ISO_A3"] === alpha3,
  );

  if (feature) return feature as Feature;
  return null;
}

/**
 * Gets the next country to be displayed from the list of countries in the metadata.
 * @param random Whether to get a random country or the first country in the list.
 * @param callback A callback function to be called after the country is retrieved.
 * @returns The country index, country data, and country coordinates.
 */
export function getNextCountry(
  random: boolean,
  callback?: () => void,
) {
  const countryIndex = random ? Math.floor(Math.random() * countriesMetadata.length) : 0;
  const country: CountryData = countriesMetadata[countryIndex];
  const countryCoords: Leaflet.LatLngTuple = [country.latitude, country.longitude];

  callback?.();

  return { countryIndex, country, countryCoords };
}

/**
 * A React Leaflet component that listens for map clicks.
 */
export function MapClick({
  callback: callback
}: {
  callback?: () => void;
}) {
  useMapEvents({
    click: () => callback?.(),
  });

  return null;
}

