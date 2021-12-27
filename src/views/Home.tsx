import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Marker } from 'react-leaflet';

import Title from 'src/components/Title';
import Map from 'src/components/Map';
import Button from 'src/components/Button';
import CountryVisitorCtrl, { newRandomCountry } from 'src/controllers/MapController';
import { markerIcon } from 'src/components/Map/Marker';
import { useMapContext } from 'src/controllers/MapContext';
import { fixName } from 'src/utility';

export default function Home(): JSX.Element {
  const { map, countryData, countryCoords, setCountryData } = useMapContext();
  const isActive = useMemo(() => !!(map && setCountryData), [map, setCountryData]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [userInput, setUserInput] = useState('');
  const [cheat, setCheat] = useState('');

  function focusInput() {
    if (inputRef?.current) inputRef.current.focus();
  }

  const centerMap = useCallback(() => {
    if (map && countryCoords) map.flyTo(countryCoords, 5, { animate: true, duration: 0.1 });
  }, [map, countryCoords]);

  function nextCountry() {
    if (!setCountryData) return null;

    const newCountry = newRandomCountry();
    setCountryData(newCountry);

    return newCountry;
  }

  useEffect(() => {
    centerMap();
  }, [centerMap]);

  function getCountryName() {
    return fixName(countryData?.name || '');
  }

  function getFixedInput() {
    return userInput.trim();
  }

  const inputMatches = () => getFixedInput() === getCountryName();

  const onSubmit = () => {
    const countryName = getCountryName();
    const stdInput = getFixedInput();

    console.log(
      `User: ${
        stdInput || '<<Empty string>>'
      }\nSolution: ${countryName}\nEqual?: ${inputMatches()}`,
    );

    setCheat(inputMatches() ? '' : countryName);

    if (map && countryCoords) map.flyTo(countryCoords, 5, { animate: true, duration: 0.1 });

    if (!countryData?.name) nextCountry();
    if (inputMatches()) {
      setUserInput(nextCountry()?.name.charAt(0) || '');
    }

    focusInput();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === 'Enter') onSubmit();
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <Title />
      <Map>
        {countryData && (
          <>
            <Marker position={[countryData.latitude, countryData.longitude]} icon={markerIcon} />
          </>
        )}
        <CountryVisitorCtrl onSubmit={onSubmit} />
      </Map>
      {countryData ? (
        <div className="flex flex-col w-full p-6 text-center text-white align-center">
          <p>What country is this?</p>
          <div className="flex justify-center">
            <input
              ref={inputRef}
              className="p-1 pl-4 text-xl text-black"
              value={userInput}
              onChange={(e) => setUserInput(e.currentTarget.value)}
              onKeyDown={onKeyDown}
            />
            <Button fit disabled={!isActive} onClick={onSubmit}>
              Submit
            </Button>
          </div>
          <span>{cheat}</span>
        </div>
      ) : (
        <div className="flex justify-center w-full p-6 text-lg text-white">
          Click the map to begin
        </div>
      )}
    </div>
  );
}
