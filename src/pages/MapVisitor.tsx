import type { KeyboardEventHandler, PropsWithChildren } from "react";
import type { LatLngExpression, LatLngTuple } from "leaflet";
import { useMemo, useRef } from "react";
import { Marker, GeoJSON } from "react-leaflet";

import type { CountryData } from "src/controllers/MapController";
import { getAllCountryFeatures } from "src/controllers/MapController";
import { Button } from "src/components/Button";
import { LeafletMap, markerIcon } from "src/components/Map";
import { useMapContext } from "src/controllers/MapContext";
import { MapClick } from "src/controllers/MapController";
import { useCountryGuess } from "src/controllers/UserInteraction";

function InputCover({ children }: PropsWithChildren) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6 text-xl italic text-white">
      {children}
    </div>
  );
}

function useUserInteraction() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { map } = useMapContext();
  const { countryCorrectAnswer, onSubmitAnswer } = useCountryGuess();

  function flyTo(destination: LatLngExpression | null) {
    if (!destination) return;

    map?.flyTo(destination, 5, {
      animate: true,
      duration: 0.1,
    });
  }

  function giveHint(answer?: string) {
    if (inputRef.current && answer) inputRef.current.value = answer.charAt(0);
  }

  function updateUI(newCountry: CountryData) {
    const destination = !newCountry
      ? countryCorrectAnswer.coordinates
      : ([newCountry.latitude, newCountry.longitude] as LatLngTuple);

    giveHint(newCountry?.name);
    flyTo(destination);

    inputRef.current?.focus();
  }

  const handleInteraction = () => {
    const result = onSubmitAnswer(inputRef.current?.value || "");
    updateUI(result.nextCountry);
  };
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === "Enter") handleInteraction();
  };

  return {
    inputRef,
    handleInteraction,
    handleKeyDown,
    countryCorrectAnswer,
    isReady: countryCorrectAnswer.data && countryCorrectAnswer.feature,
  };
}

export default function MapVisitor(): JSX.Element {
  const {
    inputRef,
    handleInteraction,
    handleKeyDown,
    countryCorrectAnswer,
    isReady,
  } = useUserInteraction();

  const allCountryFeatures = useMemo(() => getAllCountryFeatures(), []);

  return (
    <div className="grid h-full max-h-screen grid-rows-[content,1fr,content]">
      <div className="h-fit">
        <h1 className="p-2 text-center text-2xl text-white">
          Name that country!
        </h1>
      </div>

      <div className="flex h-full overflow-hidden">
        <LeafletMap>
          {countryCorrectAnswer.coordinates && (
            <Marker
              position={countryCorrectAnswer.coordinates}
              icon={markerIcon}
            />
          )}
          {allCountryFeatures.map((feature) => {
            const isAnswer =
              feature.properties?.ISO_A3 === countryCorrectAnswer.data?.alpha3;
            return (
              <GeoJSON
                key={feature.properties?.iso_a3}
                data={feature}
                style={{
                  fillColor:
                    countryCorrectAnswer.data && isAnswer ? "green" : "yellow",
                  fillOpacity: 1,
                  color: "white",
                  weight: 1,
                  interactive: false,
                }}
              />
            );
          })}
          <MapClick callback={handleInteraction} />
        </LeafletMap>

        <ol className="h-full list-decimal overflow-y-auto pl-[5ch] text-white">
          {allCountryFeatures.map((feature) => (
            <li
              key={feature.properties?.ADMIN}
              className={
                feature.properties?.ISO_A3 === "-99" ? "text-red-500" : ""
              }
            >
              {feature.properties?.ADMIN}:{feature.properties?.ISO_A3}
            </li>
          ))}
        </ol>
      </div>

      <div className="relative flex flex-col justify-center pt-2 pb-6 text-center text-white">
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
