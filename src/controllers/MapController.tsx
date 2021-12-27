import Leaflet from 'leaflet';
import { useMapEvents } from 'react-leaflet';

import countries from 'src/data/country-metadata.json';

import { useMapContext } from './MapContext';

export type CountryDataType = typeof countries[number];

export function getNextCountry(
  random: boolean,
  effect?: () => void,
): [CountryDataType, Leaflet.LatLngTuple] {
  const countryIndex = random ? Math.floor(Math.random() * countries.length) : 0;
  const country: CountryDataType = countries[countryIndex];
  const countryCoords: Leaflet.LatLngTuple = [country.latitude, country.longitude];

  if (effect) effect();

  return [country, countryCoords];
}

export function newRandomCountry() {
  const [randomCountry] = getNextCountry(true);

  return randomCountry;
}

type Props = {
  onSubmit?: () => void;
};
export default function CountryVisitorCtrl({ onSubmit }: Props) {
  const { setMap } = useMapContext();

  // * Map Controller

  const leafletMap = useMapEvents({
    click() {
      if (onSubmit) onSubmit();
      if (setMap) setMap((oldMap) => oldMap || leafletMap);
    },
  });

  return null;
}

CountryVisitorCtrl.defaultProps = {
  callback: () => null,
};
