import type { KeyboardEventHandler, PropsWithChildren } from "react";
import type { LatLngExpression, LatLngTuple } from "leaflet";
import { useState, useMemo, useRef } from "react";
import { Marker, GeoJSON } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import type { CountryData } from "src/controllers/MapController";
import { getAllCountryFeatures } from "src/controllers/MapController";
import { Button } from "src/components/Button";
import { LeafletMap, markerIcon } from "src/components/LeafletMap";
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

function useMapVisitor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { map } = useMapContext();
  const { countryCorrectAnswer, checkAnswer } = useCountryGuess();
  const [userTries, setUserTries] = useState(0);
  const [prevAnswer, setPrevAnswer] = useState<string>("");
  const [error, setError] = useState<Error | null>(null);

  function flyTo(destination: LatLngExpression | null) {
    if (!destination) return;

    map?.flyTo(destination, 5, {
      animate: true,
      duration: 0.1,
    });
  }

  function giveHint() {
    if (inputRef.current && countryCorrectAnswer.data)
      inputRef.current.value = countryCorrectAnswer.data.name.substring(
        0,
        userTries
      );
  }

  function tallyTries(isCorrectResult: boolean) {
    if (isCorrectResult) setUserTries(0);
    else setUserTries((prev) => prev + 1);
  }

  function focusInputField() {
    if (inputRef.current) inputRef.current.focus();
  }

  function updateUI(nextCountry: CountryData) {
    const destination = !nextCountry
      ? countryCorrectAnswer.coordinates
      : ([nextCountry.latitude, nextCountry.longitude] as LatLngTuple);

    flyTo(destination);
    focusInputField();
  }

  function clearInputField() {
    if (inputRef.current) inputRef.current.value = "";
  }

  const handleSubmitAnswer = () => {
    if (!inputRef.current) {
      setError(new Error("Input field not found."));
      return;
    }

    if (prevAnswer !== inputRef.current.value) {
      const result = checkAnswer(inputRef.current.value || "");
      updateUI(result.nextCountry);
      tallyTries(result.isCorrect);
    }

    setPrevAnswer(inputRef.current.value);
    clearInputField();
  };
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === "Enter") handleSubmitAnswer();
  };

  const handleMapClick = () => {
    if (countryCorrectAnswer.data) updateUI(countryCorrectAnswer.data);
    else setError(new Error("No country data found."));
  };

  const dismissError = () => setError(null);

  return {
    inputRef,
    handleSubmitAnswer,
    handleMapClick,
    handleKeyDown,
    countryCorrectAnswer,
    userTries,
    giveHint,
    isReady: countryCorrectAnswer.data && countryCorrectAnswer.feature,
    error,
    dismissError,
  };
}

export default function MapVisitor({ children }: PropsWithChildren) {
  const {
    inputRef,
    handleSubmitAnswer,
    handleMapClick,
    handleKeyDown,
    countryCorrectAnswer,
    userTries,
    giveHint,
    isReady,
    error,
    dismissError,
  } = useMapVisitor();

  const allCountryFeatures = useMemo(() => getAllCountryFeatures(), []);

  return (
    <>
      {children}

      {error?.message && (
        <div className="flex w-full flex-[0] justify-center bg-red-800 p-2 text-white">
          <div className="flex gap-6">
            {error.message}
            <button role="button" title="Dismiss" onClick={dismissError}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      <h1 className="flex-[0] p-2 text-center text-2xl text-white">
        Name that country!
      </h1>

      <main className="flex flex-1 overflow-hidden">
        <LeafletMap>
          {countryCorrectAnswer.coordinates && (
            <Marker
              position={countryCorrectAnswer.coordinates}
              icon={markerIcon}
            />
          )}
          {allCountryFeatures.map((feature) => {
            const isAnswer =
              feature.properties?.ADMIN === countryCorrectAnswer.data?.name;
            return (
              <GeoJSON
                key={feature.properties?.ADMIN}
                data={feature}
                style={{
                  fillColor:
                    countryCorrectAnswer.data && isAnswer
                      ? "#fcd34d"
                      : "#94a3b8",
                  fillOpacity: 1,
                  color: "white",
                  weight: 1,
                  interactive: false,
                }}
              />
            );
          })}
          <MapClick callback={handleMapClick} />
        </LeafletMap>

        <ol className="list-decimal overflow-y-auto pl-[5ch] text-white">
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
      </main>

      <footer className="relative flex flex-col items-center pt-2 pb-6 text-center text-white">
        <p className="p-2">Which country is this?</p>
        <div className="flex w-fit flex-col items-center">
          <div className="flex w-full justify-center">
            <input
              ref={inputRef}
              className="p-1 pl-4 text-xl text-black"
              onKeyDown={handleKeyDown}
              placeholder="Enter country name"
              disabled={!isReady}
            />
            <Button fit disabled={!isReady} onClick={handleSubmitAnswer}>
              Submit
            </Button>
          </div>
          <div className="flex w-full justify-between">
            <span>Tries: {userTries}</span>
            <button type="button" onClick={giveHint}>
              Hint!
            </button>
          </div>
        </div>

        {!isReady && <InputCover>Click the map to begin</InputCover>}
      </footer>
    </>
  );
}
