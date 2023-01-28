import { Marker, GeoJSON } from 'react-leaflet';

import { Button } from 'src/components/Button';
import { Map, markerIcon } from 'src/components/Map';
import MapClick from 'src/controllers/MapController';
import useUserInteractions from 'src/controllers/UserInteraction';

export default function MapVisitor(): JSX.Element {
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
  } = useUserInteractions();

  return (
    <div className="grid h-full grid-rows-[1fr,auto]">
      <Map>
        {countryData && (
          <Marker position={[countryData.latitude, countryData.longitude]} icon={markerIcon} />
        )}
        {countryGeometry && (
          <GeoJSON key={Date.now()} data={countryGeometry} style={{
            fillColor: 'green',
            fillOpacity: 1,
            color: 'white',
            weight: 1,
            interactive: false,
          }} />
        )}
        <MapClick callback={onSubmit} />
      </Map>

      {countryData ? (
        <div className="flex w-full flex-col justify-center p-6 text-center text-white">
          <p>Which country is this?</p>
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
        <div className="flex w-full justify-center p-6 text-lg text-white">
          Click the map to begin
        </div>
      )}
    </div>
  );
}
