import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Marker, GeoJSON } from 'react-leaflet';
import { PathOptions } from 'leaflet';
import * as Realm from 'realm-web';
import { GeoJsonObject } from 'geojson';

import fullConfig from 'src/styles/TailwindStyles';
import { fixName } from 'src/utility';

import Title from 'src/components/Title';
import Map from 'src/components/Map';
import Button from 'src/components/Button';
import { markerIcon } from 'src/components/Map/Marker';

import CountryVisitorCtrl, { newRandomCountry } from 'src/controllers/MapController';
import { getCountryGeometry, Login, realmApp, UserDetail } from 'src/controllers/UserData';
import { useMapContext } from 'src/controllers/MapContext';

const countryStyle: PathOptions = {
  fillColor: fullConfig.theme.colors?.green[700],
  fillOpacity: 1,
  color: fullConfig.theme.colors?.gray[300],
  weight: 1,
  interactive: false,
};

export default function Home(): JSX.Element {
  const { map, countryData, countryCoords, setCountryData } = useMapContext();
  const isActive = useMemo(() => !!(map && setCountryData), [map, setCountryData]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [userInput, setUserInput] = useState('');
  const [cheat, setCheat] = useState('');

  const [user, setUser] = React.useState<Realm.User | null>(realmApp.currentUser);

  function focusInput() {
    if (inputRef?.current) inputRef.current.focus();
  }

  function nextCountry() {
    if (!setCountryData) return null;

    const newCountry = newRandomCountry();
    setCountryData(newCountry);

    return newCountry;
  }

  function getFixedCountryName() {
    return fixName(countryData?.name || '');
  }

  function getFixedInput() {
    return userInput.trim();
  }

  const inputMatches = () => getFixedInput() === getFixedCountryName();

  const onSubmit = () => {
    const countryName = getFixedCountryName();
    const stdInput = getFixedInput();

    console.log(
      `User: ${
        stdInput || '<<Empty string>>'
      }\nSolution: ${countryName}\nEqual?: ${inputMatches()}`,
    );

    setCheat(inputMatches() ? '' : countryName);

    if (map && countryCoords) map.flyTo(countryCoords, 5, { animate: true, duration: 0.1 });

    if (!countryData?.name) nextCountry();
    else if (inputMatches()) setUserInput(nextCountry()?.name.charAt(0) || '');

    focusInput();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === 'Enter') onSubmit();
  };

  const onCheat = () => {
    setUserInput(fixName(countryData?.name || ''));
  };

  const [countryGeometry, setCountryGeometry] = useState<
    GeoJsonObject & {
      properties: {
        ADMIN: string;
        ISO_A3: string;
      };
    }
  >();

  // Center map
  useEffect(() => {
    if (map && countryCoords) map.flyTo(countryCoords, 5, { animate: true, duration: 0.1 });
  }, [map, countryCoords]);

  useEffect(() => {
    async function getGeometry() {
      if (!user || !countryData) return;

      const geometry = (await getCountryGeometry(user, countryData.alpha3)) as unknown;
      console.log('Fetching data:', geometry);
      setCountryGeometry(
        geometry as GeoJsonObject & {
          properties: {
            ADMIN: string;
            ISO_A3: string;
          };
        },
      );
    }
    getGeometry();
  }, [user, countryData]);

  function debugNow() {
    console.log('Repaint');
    return Date.now();
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <Title>Geomania</Title>
      {user ? <UserDetail user={user} /> : <Login setUser={setUser} />}

      {(countryData?.geometry && !countryGeometry) ||
        (countryData?.geometry && countryData?.alpha3 !== countryGeometry?.properties.ISO_A3 && (
          <div className="absolute z-50 w-full h-full text-white bg-gray-800 shadow-inner">
            Loading
          </div>
        ))}

      <Map>
        {countryData && (
          <Marker position={[countryData.latitude, countryData.longitude]} icon={markerIcon} />
        )}
        {countryGeometry && (
          <GeoJSON key={debugNow()} data={countryGeometry} style={countryStyle} />
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
          <button type="button" onClick={onCheat}>
            {cheat}
          </button>
        </div>
      ) : (
        <div className="flex justify-center w-full p-6 text-lg text-white">
          Click the map to begin
        </div>
      )}
    </div>
  );
}
