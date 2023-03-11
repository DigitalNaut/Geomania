import { useMemo, useState } from "react";
import { Marker, GeoJSON } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

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

export default function MapVisitor() {
  const { error, setError, dismissError } = useError();
  const [reviewMode, setReviewMode] = useState<"review" | "quiz">();
  const countryStore = useCountryStore();
  const { countryStored, resetStore } = countryStore;
  const mapControl = useMapControl({});

  const isStoreReady = useMemo(
    () => !!(countryStored.data && countryStored.feature),
    [countryStored]
  );

  const {
    answerInputRef,
    submitAnswer,
    userGuessTally,
    giveHint,

    guessHistory,
    countryCorrectAnswer,
    skipCountry,
    handleMapClick: handleMapClickQuiz,
  } = useCountryQuiz(countryStore, mapControl, setError);

  const { handleMapClick: handleMapClickReview, showNextCountry } =
    useCountryReview(countryStore, mapControl, setError);

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
          <LeafletMap>
            <MapClick callback={handleMapClick} />
            {countryCorrectAnswer.coordinates && (
              <Marker
                position={countryCorrectAnswer.coordinates}
                icon={markerIcon}
              />
            )}

            {allCountryFeatures.map((feature) => {
              const isHighlightedCountry =
                feature.properties?.ISO_A3 ===
                countryCorrectAnswer.data?.alpha3;

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

          {!reviewMode && (
            <InstructionOverlay>
              <button
                role="button"
                className="flex w-full flex-1 flex-col items-center justify-center gap-3 hover:bg-white/20"
                onClick={() => {
                  setReviewMode("quiz");
                  handleMapClickQuiz();
                }}
              >
                <h2 className="text-2xl">Quiz</h2>
                <p className="max-w-[50ch] text-base">
                  Learn about the cultures, geography, and history of countries
                  from around the world.
                </p>
              </button>
              <button
                role="button"
                className="flex w-full flex-1 flex-col items-center justify-center gap-3 hover:bg-white/20"
                onClick={() => {
                  setReviewMode("review");
                  handleMapClickReview();
                }}
              >
                <h2 className="text-2xl">Review</h2>
                <p className="max-w-[50ch] text-base">
                  Test your knowledge of countries with this fun guessing game.
                  Can you guess them all?
                </p>
              </button>
            </InstructionOverlay>
          )}

          {
            <FloatingHeader
              shouldShow={!!reviewMode && isStoreReady}
              imageSrc={NerdMascot}
              button={{
                label: "Finish",
                onClick: finishReview,
              }}
            >
              {reviewMode === "quiz" && "Guess the country!"}
              {reviewMode === "review" && (
                <>
                  Country: {countryStored.data?.name || "Unknown country name"}
                </>
              )}
            </FloatingHeader>
          }

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
