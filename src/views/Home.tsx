import React, { useMemo, useState } from 'react';
import { Marker } from 'react-leaflet';

import Title from 'src/components/Title';
import Map from 'src/components/Map';
import Button from 'src/components/Button';
import CountryVisitorCtrl, { flyToRandomCountry } from 'src/controllers/MapController';
import { markerIcon } from 'src/components/Map/Marker';
import MapContextProvider, { useMapContext } from 'src/controllers/MapContext';

export default function Home(): JSX.Element {
  const { map, setMap, countryData, setCountryData } = useMapContext();
  const [userInput, setUserInput] = useState(countryData?.name);
  const isActive = useMemo(() => {
    return !!(map && setCountryData);
  }, [map, setCountryData]);

  return (
    <div className="flex flex-col w-full h-screen">
      <Title />
      <Map>
        {countryData && (
          <Marker position={[countryData.latitude, countryData.longitude]} icon={markerIcon} />
        )}
        <MapContextProvider>
          {setMap && <CountryVisitorCtrl saveCountry={setCountryData} setMap={setMap} />}
        </MapContextProvider>
      </Map>
      {countryData ? (
        <div className="flex flex-col w-full p-6 text-center text-white align-center">
          <p>Which country is this?</p>
          <div className="flex justify-center">
            <input
              className="p-1 pl-4 text-xl text-black"
              value={userInput || countryData?.name}
              onChange={(e) => setUserInput(e.currentTarget.value)}
            />

            <Button
              fit
              disabled={!isActive}
              onClick={() =>
                isActive && map && setCountryData && setCountryData(flyToRandomCountry(map))
              }
            >
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
