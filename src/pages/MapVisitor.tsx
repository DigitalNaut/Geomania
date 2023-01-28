import type { KeyboardEventHandler, PropsWithChildren } from 'react';
import { useRef } from 'react';
import { Marker, GeoJSON } from 'react-leaflet';

import type { CountryData } from 'src/controllers/MapController';
import { Button } from 'src/components/Button';
import { LeafletMap, markerIcon } from 'src/components/Map';
import { useMapContext } from 'src/controllers/MapContext';
import { MapClick } from 'src/controllers/MapController';
import { useCountryGuess } from 'src/controllers/UserInteraction';

function InputCover({ children }: PropsWithChildren) {
  return <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gray-900 p-6 text-xl italic text-white">
    {children}
  </div>
}

function useUserInteraction() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { map } = useMapContext();
  const {
    countryCorrectAnswer,
    onSubmitAnswer,
  } = useCountryGuess();

  function updateUI(newCountry: CountryData) {
    if (!newCountry) return;

    if (inputRef.current) inputRef.current.value = newCountry.name.charAt(0);
    inputRef.current?.focus();

    map?.flyTo([newCountry.latitude, newCountry.longitude], 5, {
      animate: true,
      duration: 0.1,
    });
  }

  const handleInteraction = () => {
    const result = onSubmitAnswer(inputRef.current?.value || "");
    updateUI(result.nextCountry);
  }
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === "Enter") handleInteraction();
  };

  return {
    inputRef,
    handleInteraction,
    handleKeyDown,
    countryCorrectAnswer,
    isReady: countryCorrectAnswer.data && countryCorrectAnswer.feature
  }
}

export default function MapVisitor(): JSX.Element {
  const {
    inputRef,
    handleInteraction,
    handleKeyDown,
    countryCorrectAnswer,
    isReady,
  } = useUserInteraction();

  return (
    <div className="grid h-full grid-rows-[auto,1fr,auto]">
      <div>
        <h1 className="p-2 text-center text-2xl text-white">Name that country!</h1>
      </div>

      <LeafletMap>
        {countryCorrectAnswer.coordinates && (
          <Marker position={countryCorrectAnswer.coordinates} icon={markerIcon} />
        )}
        {countryCorrectAnswer.feature && (
          <GeoJSON key={countryCorrectAnswer.data?.alpha3} data={countryCorrectAnswer.feature} style={{
            fillColor: 'green',
            fillOpacity: 1,
            color: 'white',
            weight: 1,
            interactive: false,
          }} />
        )}
        <MapClick callback={handleInteraction} />
      </LeafletMap>

      <div className="relative flex w-full flex-col justify-center pt-2 pb-6 text-center text-white">
        <p className="p-2">Which country is this?</p>
        <div className="flex justify-center">
          <input
            ref={inputRef}
            className="p-1 pl-4 text-xl text-black"
            onKeyDown={handleKeyDown}
            placeholder="Enter country name"
            disabled={!isReady}
          />
          <Button fit disabled={!isReady} onClick={handleInteraction}>
            Submit
          </Button>
        </div>
        {/* <button type="button" onClick={onCheat}>
            {cheat}
          </button> */}

        {!isReady && <InputCover>Click the map to begin</InputCover>}
      </div>
    </div>
  );
}
