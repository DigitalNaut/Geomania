import { useMemo, useState } from "react";
import { Marker, GeoJSON, ZoomControl, Popup } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";

import { getAllCountryFeatures } from "src/controllers/MapController";
import { MapClick } from "src/components/MapClick";
import { LeafletMap, markerIcon } from "src/components/LeafletMap";
import GuessHistoryPanel from "src/components/GuessHistoryPanel";
import UserGuessFloatingPanel from "src/components/UserGuessFloatingPanel";
import UserReviewFloatingPanel from "src/components/UserReviewFloatingPanel";
import FloatingHeader from "src/components/FloatingHeader";
import InstructionOverlay from "src/components/InstructionOverlay";
import MainView from "src/components/MainView";
import { useCountryQuiz } from "src/controllers/useCountryQuiz";
import { useCountryReview } from "src/controllers/useCountryReview";
import { useError } from "src/hooks/useError";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useMapControl } from "src/hooks/useMapControl";
import NerdMascot from "src/assets/images/mascot-nerd.min.svg";

export default function MapReview() {
  const { error, setError, dismissError } = useError();
  const [reviewMode, setReviewMode] = useState<"review" | "quiz">();
  const countryStore = useCountryStore();
  const { countryStored, resetStore } = countryStore;

  const mapControl = useMapControl({});
  const { handleMapClick: handleMapClickReview, showNextCountry } =
    useCountryReview(countryStore, mapControl, setError);
  const {
    answerInputRef,
    submitAnswer,
    userGuessTally,
    giveHint,
    guessHistory,
    skipCountry,
    handleMapClick: handleMapClickQuiz,
  } = useCountryQuiz(countryStore, mapControl, setError);

  const isStoreReady = useMemo(
    () => !!(countryStored.data && countryStored.feature),
    [countryStored]
  );

  const allCountryFeatures = useMemo(() => getAllCountryFeatures(), []);

  const handleMapClick =
    reviewMode === "review"
      ? handleMapClickReview
      : reviewMode === "quiz"
      ? handleMapClickQuiz
      : undefined;

  const finishReview = () => {
    setReviewMode(undefined);
    resetStore();
    mapControl.resetView();
  };

  return (
    <>
      {error && (
        <div className="flex w-full flex-[0] justify-center bg-red-800 p-2">
          <div className="flex gap-6">
            {error.message}
            <button role="button" title="Dismiss" onClick={dismissError}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      <MainView>
        <div className="relative h-full w-full overflow-hidden rounded-lg shadow-inner">
          <LeafletMap isReviewMode={isStoreReady}>
            <MapClick callback={handleMapClick} />

            {!!reviewMode && <ZoomControl />}

            {countryStored.coordinates && (
              <>
                <Marker
                  position={countryStored.coordinates}
                  icon={markerIcon}
                />
                {reviewMode === "review" && (
                  <Popup
                    position={countryStored.coordinates}
                    keepInView
                    closeButton
                    autoClose={false}
                    closeOnClick={false}
                    closeOnEscapeKey={false}
                    autoPan={false}
                    eventHandlers={{
                      remove: () => console.log("remove"),
                    }}
                  >
                    <h3 className="text-xl">{countryStored.data?.name}</h3>
                  </Popup>
                )}
              </>
            )}

            {allCountryFeatures.map((feature) => {
              const isHighlightedCountry =
                feature.properties?.ISO_A3 === countryStored.data?.alpha3;

              return (
                <GeoJSON
                  key={feature.properties?.ADMIN}
                  data={feature}
                  style={{
                    fillColor: isHighlightedCountry ? "#fcd34d" : "#94a3b8",
                    fillOpacity: 1,
                    color: "white",
                    weight: 1,
                    interactive: false,
                  }}
                />
              );
            })}
          </LeafletMap>

          <InstructionOverlay shouldShow={!reviewMode}>
            <button
              role="button"
              className="w-full flex-1 items-center justify-center gap-3 hover:bg-white/10"
              onClick={() => {
                setReviewMode("quiz");
                handleMapClickQuiz();
              }}
            >
              <div className="m-auto flex w-fit items-center gap-4 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-6 shadow-lg">
                <div className="inline-block">
                  <h2 className="text-2xl">📝 Practice</h2>
                  <p className="inline-block max-w-[40ch] text-base">
                    Test your knowledge of countries with this fun guessing
                    game. Can you guess them all?
                  </p>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </button>
            <button
              role="button"
              className="w-full flex-1 items-center justify-center gap-3 hover:bg-white/10"
              onClick={() => {
                setReviewMode("review");
                handleMapClickReview();
              }}
            >
              <div className="m-auto flex w-fit items-center gap-4 rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 shadow-lg">
                <div className="inline-block">
                  <h2 className="text-2xl">🗺 Review</h2>
                  <p className="inline-block max-w-[40ch] text-base">
                    Learn about the cultures, geography, and history of
                    countries from around the world.
                  </p>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </button>
          </InstructionOverlay>

          <FloatingHeader
            shouldShow={!!reviewMode && isStoreReady}
            imageSrc={NerdMascot}
            button={{
              label: "Finish",
              onClick: finishReview,
            }}
          >
            {reviewMode === "quiz" && "Guess the country!"}
            {reviewMode === "review" && "Reviewing countries"}
          </FloatingHeader>

          <UserGuessFloatingPanel
            shouldShow={isStoreReady && reviewMode === "quiz"}
            visitor={{
              answerInputRef,
              submitAnswer,
              userGuessTally,
              giveHint,
              skipCountry,
            }}
            incorrectAnswerAudioSrc="src/assets/sounds/incorrect.mp3"
            correctAnswerAudioSrc="src/assets/sounds/correct.mp3"
          />

          <UserReviewFloatingPanel
            shouldShow={isStoreReady && reviewMode === "review"}
            visitor={{
              showNextCountry,
            }}
          />
        </div>

        <GuessHistoryPanel guessHistory={guessHistory} />
      </MainView>
    </>
  );
}
