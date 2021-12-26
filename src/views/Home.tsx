import React, { useState } from 'react';
import { Marker } from 'react-leaflet';

import Title from 'src/components/Title';
import Map from 'src/components/Map';
import Button from 'src/components/Button';
import CountryVisitorCtrl, { CountryDataType } from 'src/controllers/MapController';
import { markerIcon } from 'src/components/Map/Marker';

export default function HomeView(): JSX.Element {
  const [countryData, setCountryData] = useState<CountryDataType>();

  return (
    <div className="flex flex-col w-full h-screen">
      <Title />
      <Map>
        {countryData && (
          <Marker position={[countryData.latitude, countryData.longitude]} icon={markerIcon} />
        )}
        <CountryVisitorCtrl callback={setCountryData} />
      </Map>
      {countryData ? (
        <div className="flex flex-col w-full p-6 text-center text-white align-center">
          <p>Which country is this?</p>
          <div className="flex justify-center">
            <input className="p-2 text-black" value={countryData?.name} />
            <Button fit>Submit</Button>
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
