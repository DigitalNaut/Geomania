import React from 'react';
import Leaflet from 'leaflet';
import { useMapEvents } from 'react-leaflet';
import countries from 'src/data/country-metadata.json';

export type CountryDataType = typeof countries[number];

type SaveCountryFn = React.Dispatch<React.SetStateAction<CountryDataType | undefined>> | undefined;
type RandomCountryVisitorProps = {
  countryData?: CountryDataType;
  saveCountry: SaveCountryFn;
  setMap?: React.Dispatch<React.SetStateAction<Leaflet.Map | undefined>>;
};

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

export function flyToRandomCountry(map: Leaflet.Map) {
  const [randomCountry, countryCoords] = getNextCountry(true);

  map.flyTo(countryCoords, 5, { animate: true, duration: 0.1 });

  return randomCountry;
}

export default function CountryVisitorCtrl({ saveCountry, setMap }: RandomCountryVisitorProps) {
  // * Map Controller

  const leafletMap = useMapEvents({
    click() {
      if (saveCountry) saveCountry(flyToRandomCountry(leafletMap));
      if (setMap) setMap((oldMap) => oldMap || leafletMap);
    },
  });

  return null;
}

CountryVisitorCtrl.defaultProps = {
  callback: () => null,
};
