import React, { useState } from 'react';

import Title from 'src/components/Title';
import Map from 'src/components/Map';
import Button from 'src/components/Button';
import CountryVisitorCtrl, { CountryDataType } from 'src/controllers/MapController';
import Input from 'src/components/Map/Input';

export default function HomeView(): JSX.Element {
  const [countryData, setCountryData] = useState<CountryDataType>();

  return (
    <div className="flex flex-col w-full h-screen">
      <Title />
      <Map>
        {countryData && (
          <Input position={[countryData.latitude, countryData.longitude]} text={countryData.name} />
        )}
        <CountryVisitorCtrl callback={setCountryData} />
      </Map>
      <div className="flex justify-center w-full p-6">
        <Button>Begin</Button>
      </div>
    </div>
  );
}
