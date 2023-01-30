import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { Marker, GeoJSON } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
import { useMapVisitor } from "src/pages/MapVisitor.hooks";

function InputCover({ children }: PropsWithChildren) {
  return (
    <div className="pointer-events-none absolute inset-1/2 z-[1000] flex h-max w-max -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-gray-900/60 px-12 py-8 text-xl italic text-white">
      {children}
    </div>
  );
}

function FloatingHeader({ children }: PropsWithChildren) {
  return (
    <div className="absolute inset-x-1/2 top-5 z-[1000] h-max w-1/4 -translate-x-1/2 shadow-md">
      <h1 className="rounded-lg bg-slate-900 px-6 py-4 text-center text-2xl text-white">
        {children}
      </h1>
    </div>
  );
}

function GuessHeaderSection({
  children,
  skipCountryHandler,
}: PropsWithChildren & {
  skipCountryHandler: () => void;
}) {
  return (
    <div className="flex gap-2 rounded-md bg-slate-800">
      <p className="p-2">{children}</p>
      <button
        className="flex items-center gap-1 p-2 underline"
        role="button"
        title="Skip country"
        onClick={skipCountryHandler}
      >
        <span>Skip</span>
        <FontAwesomeIcon icon={faForward} />
      </button>
    </div>
  );
}

function GuessInfoSection({
  giveHintHandler,
  prevGuess,
  userTries,
}: {
  giveHintHandler: () => void;
  prevGuess: string | null;
  userTries: number;
}) {
  return (
    <div
      className="flex w-full justify-between rounded-md p-2"
      // TODO: Revert
      // style={{ visibility: userTries > 0 ? "visible" : "hidden" }}
    >
      <span>Guesses: {userTries}</span>
      {prevGuess && <div>Last guess: &ldquo;{prevGuess}&rdquo;</div>}
      <button
        className="flex items-center gap-1 underline"
        type="button"
        onClick={giveHintHandler}
      >
        <FontAwesomeIcon icon={faQuestionCircle} />
        <span>Hint!</span>
      </button>
    </div>
  );
}

function UserGuessFloatingPanel({
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
    <div
      className="absolute inset-x-1/2 bottom-8 z-[1000] flex h-fit w-fit -translate-x-1/2 flex-col items-center gap-2 rounded-md text-center text-white"
      style={{ visibility: isReady ? "visible" : "hidden" }}
    >
      <GuessHeaderSection skipCountryHandler={handleSkipCountry}>
        Which country is this?
      </GuessHeaderSection>

      <div className="flex w-fit flex-col items-center overflow-hidden rounded-md bg-slate-900 drop-shadow-lg">
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

        <GuessInfoSection
          giveHintHandler={giveHint}
          prevGuess={prevGuess}
          userTries={userTries}
        />
      </div>
    </div>
  );
}

function CountryListPanel({
  features,
}: // metadata,
{
  features: GeoJSON.Feature[];
  metadata: CountryData[];
}) {
  return (
    <ol className="list-decimal overflow-y-auto bg-slate-800 pl-[5ch] text-white">
      {features.map((feature) => {
        // const pair = metadata.find(
        //   (meta) => meta?.alpha3 === feature.properties?.ISO_A3
        // );
        return (
          <li key={feature.properties?.ADMIN}>
            {feature.properties?.ADMIN}:&nbsp;
            {/* <Checkmark condition={!!pair?.name} property="Has pair" />
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
            /> */}
          </li>
        );
      })}
    </ol>
  );
}

export default function MapVisitor() {
  const visitor = useMapVisitor();
  const { handleMapClick, countryCorrectAnswer, isReady, error, dismissError } =
    visitor;

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

      <main className="flex flex-1 overflow-hidden">
        <div className="relative h-full w-full">
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
                feature.properties?.ISO_A3 ===
                countryCorrectAnswer.data?.alpha3;

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

          {isReady && <FloatingHeader>Guess the country!</FloatingHeader>}

          {!isReady && <InputCover>Click to start</InputCover>}

          <UserGuessFloatingPanel visitor={visitor} />
        </div>

        <CountryListPanel
          metadata={allCountryMetadata}
          features={allCountryFeatures}
        />
      </main>
    </>
  );
}
