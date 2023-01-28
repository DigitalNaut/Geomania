import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { Marker, GeoJSON } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faForward, faTimes } from "@fortawesome/free-solid-svg-icons";

import { getAllCountryFeatures } from "src/controllers/MapController";
import { Button } from "src/components/Button";
import { LeafletMap, markerIcon } from "src/components/LeafletMap";
import { MapClick } from "src/controllers/MapController";
import { useMapVisitor } from "src/pages/MapVisitor.logic";

function InputCover({ children }: PropsWithChildren) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6 text-xl italic text-white">
      {children}
    </div>
  );
}

export default function MapVisitor({ children }: PropsWithChildren) {
  const {
    inputRef,
    handleSubmitAnswer,
    handleMapClick,
    handleKeyDown,
    handleSkipCountry,
    countryCorrectAnswer,
    userTries,
    giveHint,
    isReady,
    prevGuess,
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
          <div className="flex gap-2">
            <div className="flex w-full justify-center overflow-hidden rounded-md">
              <input
                className="p-1 pl-4 text-xl text-black focus:ring focus:ring-inset"
                ref={inputRef}
                onKeyDown={handleKeyDown}
                placeholder="Enter country name"
                disabled={!isReady}
              />
              <Button fit disabled={!isReady} onClick={handleSubmitAnswer}>
                Submit
              </Button>
            </div>
            <button
              role="button"
              title="Skip country"
              onClick={handleSkipCountry}
            >
              <FontAwesomeIcon icon={faForward} size="2x" />
            </button>
          </div>
          <div
            className="flex w-full justify-between"
            style={{ visibility: userTries > 0 ? "visible" : "hidden" }}
          >
            <span>Tries: {userTries}</span>
            {prevGuess && <div>Previous guess: {prevGuess}</div>}
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
