import Leaflet from 'leaflet';
import { useMapEvent } from 'react-leaflet';
import countries from 'src/data/country-metadata.json';

export type CountryDataType = typeof countries[number];

type StateUpdateFn = React.Dispatch<React.SetStateAction<CountryDataType | undefined>>;
type RandomCountryVisitorProps = {
  countryData?: CountryDataType;
  callback: StateUpdateFn;
};

export default function RandomCountryVisitorCtrl({ callback }: RandomCountryVisitorProps) {
  // * Map Controller

  const map = useMapEvent('click', () => {
    const randomCountryIndex = 0; // Predetermined
    // const randomCountryIndex = Math.floor(Math.random() * countries.length); // Random
    const randomCountry = countries[randomCountryIndex];
    const countryCoords: Leaflet.LatLngTuple = [randomCountry.latitude, randomCountry.longitude];

    map.flyTo(countryCoords, 5, { animate: true, duration: 0.1 });

    callback(randomCountry);
  });

  return null;
}
