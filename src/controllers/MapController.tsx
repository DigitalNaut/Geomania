import type Leaflet from 'leaflet';
import { useMapEvents } from 'react-leaflet';

import countriesMetadata from 'src/data/country-metadata.json';
import countryGeometries from 'src/data/country-geometries.json';

export type CountryData = typeof countriesMetadata[number];
export type CountryGeometry = typeof countryGeometries["features"][number]["geometry"];

export function getCountryGeometry(alpha3: string) {
  return countryGeometries["features"].find(
    (feature) => feature["properties"]["ISO_A3"] === alpha3,
  );
}

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

type Props = {
  callback?: () => void;
};
export default function MapClick({ callback: callback }: Props) {
  // * Map Controller

  useMapEvents({
    click() {
      callback?.();
    },
  });

  return null;
}

