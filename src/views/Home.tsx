import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Marker, GeoJSON } from 'react-leaflet';

import Title from 'src/components/Title';
import Map from 'src/components/Map';
import Button from 'src/components/Button';
import CountryVisitorCtrl, { newRandomCountry } from 'src/controllers/MapController';
import { markerIcon } from 'src/components/Map/Marker';
import { useMapContext } from 'src/controllers/MapContext';
import { fixName } from 'src/utility';

import * as Realm from 'realm-web';
import { getData } from 'src/controllers/database';
import { PathOptions } from 'leaflet';
import styles from 'src/styles/TailwindStyles';
import { GeoJsonObject } from 'geojson';
import colors from 'tailwindcss/colors';

const REALM_APP_ID = 'geomania-gxxmr'; // e.g. myapp-abcde
export const realmApp: Realm.App = new Realm.App({ id: REALM_APP_ID });

// Create a component that displays the given user's details
export const UserDetail: React.FC<{ user: Realm.User }> = ({ user }) => {
  return (
    <div>
      <h1 className="text-white">Logged in with anonymous id: {user.id} </h1>
    </div>
  );
};
// Create a component that lets an anonymous user log in
export const Login: React.FC<{ setUser: (user: Realm.User) => void }> = ({ setUser }) => {
  const loginAnonymous = async () => {
    const user: Realm.User = await realmApp.logIn(Realm.Credentials.anonymous());
    setUser(user);
  };
  return (
    <button type="button" className="text-white" onClick={loginAnonymous}>
      Log In
    </button>
  );
};

const themeColors = styles?.theme?.colors;

const countryStyle: PathOptions = {
  fillColor: colors.green[700],
  fillOpacity: 1,
  color: colors.gray[300],
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

  const [countryGeometry, setCountryGeometry] = useState<GeoJsonObject>();

  useEffect(() => {
    async function getGeometry() {
      if (!user || !countryData) return;

      const geometry = (await getData(user, countryData.alpha3)) as unknown;
      setCountryGeometry(geometry as GeoJsonObject);
    }
    getGeometry();
  }, [user, countryData]);

  function debugNow() {
    console.log('Repaint');
    return Date.now();
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <Title />
      {user ? <UserDetail user={user} /> : <Login setUser={setUser} />}
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
