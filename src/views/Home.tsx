import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Marker } from 'react-leaflet';

import Title from 'src/components/Title';
import Map from 'src/components/Map';
import Button from 'src/components/Button';
import CountryVisitorCtrl, { newRandomCountry } from 'src/controllers/MapController';
import { markerIcon } from 'src/components/Map/Marker';
import { useMapContext } from 'src/controllers/MapContext';
import { LatLngTuple } from 'leaflet';

export default function Home(): JSX.Element {
  const { map, countryData, setCountryData } = useMapContext();
  const isActive = useMemo(() => !!(map && setCountryData), [map, setCountryData]);

  const [userInput, setUserInput] = useState('');

  const countryCoords: LatLngTuple | null = useMemo(
    () => (countryData ? [countryData.latitude, countryData.longitude] : null),
    [countryData],
  );

  const centerMap = useCallback(() => {
    if (map && countryCoords) map.flyTo(countryCoords, 5, { animate: true, duration: 0.1 });
  }, [map, countryCoords]);

  useEffect(() => {
    centerMap();
  }, [centerMap]);

  const onSubmit = () => {
    if (!setCountryData) return;

    console.log('Userinput:', userInput, 'Country Name:', countryData?.name);

    if (map && countryCoords) map.flyTo(countryCoords, 5, { animate: true, duration: 0.1 });

    if (!countryData?.name) setCountryData(newRandomCountry());
    if (userInput === countryData?.name) {
      setCountryData(newRandomCountry());
      setUserInput('');
    }
  };

  const onEnterKey: React.KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === 'Enter') onSubmit();
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <Title />
      <Map>
        {countryData && (
          <Marker position={[countryData.latitude, countryData.longitude]} icon={markerIcon} />
        )}
        <CountryVisitorCtrl onSubmit={onSubmit} />
      </Map>
      {countryData ? (
        <div className="flex flex-col w-full p-6 text-center text-white align-center">
          <p>What country is this?</p>
          <div className="flex justify-center">
            <input
              className="p-1 pl-4 text-xl text-black"
              value={userInput}
              onChange={(e) => setUserInput(e.currentTarget.value)}
              onKeyDown={onEnterKey}
            />

            <Button fit disabled={!isActive} onClick={onSubmit}>
              Submit
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center w-full p-6 text-lg text-white">
          Click the map to begin
        </div>
      )}
    </div>
  );
}
