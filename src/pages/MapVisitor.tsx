import type { PropsWithChildren } from "react";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faShip, faCar } from "@fortawesome/free-solid-svg-icons";
import { useMemo } from "react";
import { Marker, GeoJSON } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faForward,
  faQuestionCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import type { CountryData } from "src/controllers/MapController";
import {
  getAllCountriesMetadata,
  getAllCountryFeatures,
} from "src/controllers/MapController";
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

function UserGuessPanel({
  visitor: {
    handleSkipCountry,
    inputRef,
    handleKeyDown,
    isReady,
    handleSubmitAnswer,
    userTries,
    giveHint,
    prevGuess,
  },
}: {
  visitor: ReturnType<typeof useMapVisitor>;
}) {
  return (
    <div className="absolute inset-x-1/2 bottom-8 z-[10000] flex h-fit w-fit -translate-x-1/2 flex-col items-center gap-2 rounded-md text-center text-white">
      <div className="flex gap-2 rounded-md bg-slate-800">
        <p className="p-2">Which country is this?</p>
        <button
          className="flex items-center gap-1 p-2 underline"
          role="button"
          title="Skip country"
          onClick={handleSkipCountry}
        >
          <span>Skip</span>
          <FontAwesomeIcon icon={faForward} />
        </button>
      </div>
      <div className="flex w-fit flex-col items-center">
        <div className="flex w-full justify-center overflow-hidden rounded-md">
          <input
            className="p-1 pl-4 text-xl text-black focus:ring focus:ring-inset"
            ref={inputRef}
            onKeyDown={handleKeyDown}
            placeholder="Enter country name"
            disabled={!isReady}
            maxLength={50}
          />
          <Button fit disabled={!isReady} onClick={handleSubmitAnswer}>
            Submit
          </Button>
        </div>

        <div
          className="flex w-full justify-between rounded-md bg-slate-800 p-2"
          style={{ visibility: userTries > 0 ? "visible" : "hidden" }}
        >
          <span>Guesses: {userTries}</span>
          {prevGuess && <div>Last guess: &ldquo;{prevGuess}&rdquo;</div>}
          <button
            className="flex items-center gap-2 underline"
            type="button"
            onClick={giveHint}
          >
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span>Hint!</span>
          </button>
        </div>
      </div>

      {!isReady && <InputCover>Click to start</InputCover>}
    </div>
  );
}

function Checkmark({
  condition,
  property,
  trueIcon = faCheck,
  falseIcon = faTimes,
  trueColor = "text-green-500",
  falseColor = "text-red-500",
}: {
  condition: boolean;
  property: string;
  trueIcon?: IconDefinition;
  falseIcon?: IconDefinition;
  trueColor?: string;
  falseColor?: string;
}) {
  return (
    <FontAwesomeIcon
      className={condition ? trueColor : falseColor}
      icon={condition ? trueIcon : falseIcon}
      title={"Has " + property}
    />
  );
}

function CountryListPanel({
  features,
  metadata,
}: {
  features: GeoJSON.Feature[];
  metadata: CountryData[];
}) {
  return (
    <ol className="list-decimal overflow-y-auto pl-[5ch] text-white">
      {features.map((feature) => {
        const pair = metadata.find(
          (meta) => meta?.alpha3 === feature.properties?.ISO_A3
        );
        return (
          <li key={feature.properties?.ADMIN}>
            {feature.properties?.ADMIN}:&nbsp;
            <Checkmark condition={!!pair?.name} property="Has pair" />
            <Checkmark condition={!!feature.geometry} property="Has geometry" />
            <Checkmark
              condition={feature.properties?.ISO_A3 !== "-99"}
              property="Has ISO3"
            />
            <Checkmark
              condition={!!pair?.island}
              property="Is island"
              trueIcon={faShip}
              falseIcon={faCar}
              trueColor="text-blue-500"
              falseColor="text-yellow-500"
            />
          </li>
        );
      })}
    </ol>
  );
}

export default function MapVisitor() {
  const visitor = useMapVisitor();
  const { handleMapClick, countryCorrectAnswer, error, dismissError } = visitor;

  const allCountryFeatures = useMemo(() => getAllCountryFeatures(), []);
  const allCountryMetadata = useMemo(() => {
    return getAllCountriesMetadata();
  }, []);

  return (
    <>
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

      <main className="relative flex flex-1 overflow-hidden">
        <LeafletMap>
          <MapClick callback={handleMapClick} />
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
        </LeafletMap>

        <UserGuessPanel visitor={visitor} />
        <CountryListPanel
          metadata={allCountryMetadata}
          features={allCountryFeatures}
        />
      </main>
    </>
  );
}
