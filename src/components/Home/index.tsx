import React, { useState } from 'react';
import { Marker, GeoJSON } from 'react-leaflet';
import { PathOptions } from 'leaflet';

import fullConfig from 'src/styles/TailwindStyles';

import Title from 'src/components/Title';
import Map from 'src/components/Map';
import Button from 'src/components/Button';
import { markerIcon } from 'src/components/Map/Marker';

import CountryVisitorCtrl from 'src/controllers/MapController';
import { Login, realmApp, UserDetail } from 'src/controllers/UserData';
import useUserInteraction from 'src/controllers/UserInteraction';

const countryStyle: PathOptions = {
  fillColor: fullConfig.theme.colors?.green[700],
  fillOpacity: 1,
  color: fullConfig.theme.colors?.gray[300],
  weight: 1,
  interactive: false,
};

export default function Home(): JSX.Element {
  const [user, setUser] = useState(realmApp.currentUser);
  const {
    inputRef,
    userInput,
    setUserInput,
    hasCountryData,
    countryData,
    countryGeometry,
    onSubmit,
    onKeyDown,
    cheat,
    onCheat,
  } = useUserInteraction(user);

  const debugNow = () => Date.now();

  return (
    <div className="flex flex-col w-full h-screen">
      <Title>Geomania</Title>
      {user ? <UserDetail user={user} /> : <Login setUser={setUser} />}

      {countryData?.geometry &&
        (!countryGeometry ||
          (countryData?.geometry &&
            countryData?.alpha3 !== countryGeometry?.properties.ISO_A3)) && (
          <div className="absolute z-50 w-full h-full text-white bg-gray-800 shadow-inner">
            Loading...
          </div>
        )}

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
            <Button fit disabled={!hasCountryData} onClick={onSubmit}>
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
