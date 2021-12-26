import React from 'react';
import Leaflet from 'leaflet';
import { useMapEvent } from 'react-leaflet';
import countries from 'src/data/country-metadata.json';

export type CountryDataType = typeof countries[number];

type StateUpdateFn = React.Dispatch<React.SetStateAction<CountryDataType | undefined>>;
type RandomCountryVisitorProps = {
  countryData?: CountryDataType;
  callback: StateUpdateFn;
};

export default function CountryVisitorCtrl({ callback }: RandomCountryVisitorProps) {
  function getCountry(
    random: boolean,
    effect?: () => void,
  ): [CountryDataType, Leaflet.LatLngTuple] {
    const countryIndex = random ? Math.floor(Math.random() * countries.length) : 0;
    const country: CountryDataType = countries[countryIndex];
    const countryCoords: Leaflet.LatLngTuple = [country.latitude, country.longitude];

    if (effect) effect();

    return [country, countryCoords];
  }

  // * Map Controller

  const map = useMapEvent('click', () => {
    const [randomCountry, countryCoords] = getCountry(false);

    map.flyTo(countryCoords, 5, { animate: true, duration: 0.1 });
    callback(randomCountry);
  });

  return null;
}

CountryVisitorCtrl.defaultProps = {
  callback: () => null,
};
