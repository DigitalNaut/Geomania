import { useState } from "react";
import { Marker, ZoomControl, Popup } from "react-leaflet";

import { BackControl, MapClick } from "src/components/map";
import { LeafletMap, markerIcon } from "src/components/map/LeafletMap";
import { useCountryQuiz } from "src/controllers/useCountryQuiz";
import { useCountryReview } from "src/controllers/useCountryReview";
import { useError } from "src/hooks/useError";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useMapViewport } from "src/hooks/useMapViewport";
import { SvgMap } from "src/components/map/MapSvg";
import { ActivityButton } from "src/components/activity/ActivityButton";
import useActivityHelper from "src/controllers/useActivityHelper";
import ErrorBanner from "src/components/common/ErrorBanner";
import GuessHistoryPanel from "src/components/activity/GuessHistoryPanel";
import QuizFloatingPanel from "src/components/activity/QuizFloatingPanel";
import ReviewFloatingPanel from "src/components/activity/ReviewFloatingPanel";
import FloatingHeader from "src/components/activity/FloatingHeader";
import InstructionOverlay from "src/components/activity/InstructionOverlay";
import MainView from "src/components/layout/MainView";
import CountriesListPanel from "src/components/activity/CountriesListPanel";
import RegionsDisabledOverlay from "src/components/activity/RegionsToggle";

import NerdMascot from "src/assets/images/mascot-nerd.min.svg";
import IncorrectSound from "src/assets/sounds/incorrect.mp3?url";
import CorrectSound from "src/assets/sounds/correct.mp3?url";

type ActivityMode = "review" | "quiz";

const incorrectAnswerAudioSrc = new URL(IncorrectSound, import.meta.url);
const correctAnswerAudioSrc = new URL(CorrectSound, import.meta.url);

export default function MapActivity() {
  const { error, setError, dismissError } = useError();
  const [activityMode, setActivityMode] = useState<ActivityMode>();
  const { storedCountry, resetStore, filteredCountryData } = useCountryStore();

  const {
    handleMapClick: handleMapClickReview,
    showNextCountry,
    isRandomReviewMode,
    setRandomReviewMode,
  } = useCountryReview(activityMode === "review", setError);
  const {
    answerInputRef,
    submitAnswer,
    userGuessTally,
    giveHint,
    guessHistory,
    skipCountry,
    handleMapClick: handleMapClickQuiz,
  } = useCountryQuiz(setError);

  useActivityHelper(!!activityMode, isRandomReviewMode);

  const { resetView } = useMapViewport();
  const finishActivity = () => {
    setActivityMode(undefined);
    resetStore();
    resetView();
  };

  return (
    <>
      {error && <ErrorBanner error={error} dismissError={dismissError} />}

      <MainView>
        <div className="relative h-full w-full overflow-hidden rounded-lg shadow-inner">
          <LeafletMap>
            {activityMode && (
              <>
                <ZoomControl position="topright" />

                <BackControl position="topleft" label="Finish" onClick={finishActivity} />
              </>
            )}

            {storedCountry.coordinates && (
              <>
                <Marker position={storedCountry.coordinates} icon={markerIcon} />
                {activityMode === "review" && (
                  <Popup
                    position={storedCountry.coordinates}
                    keepInView
                    closeButton
                    autoClose={false}
                    closeOnClick={false}
                    closeOnEscapeKey={false}
                    autoPan={false}
                    eventHandlers={{
                      remove: () =>
                        // TODO: Find a better way to handle this
                        console.log("Popup removed, please provide an alternative place to display the country name"),
                    }}
                  >
                    <h3 className="text-xl">{storedCountry.data?.name}</h3>
                  </Popup>
                )}
              </>
            )}

            {activityMode === "quiz" && <MapClick callback={handleMapClickQuiz} />}

            <SvgMap
              highlightAlpha3={storedCountry.data?.a3}
              onClick={handleMapClickReview}
              enableOnClick={activityMode === "review"}
            />
          </LeafletMap>

          <InstructionOverlay shouldShow={!activityMode}>
            <ActivityButton
              label="🗺 Review"
              onClick={() => {
                setActivityMode("review");
                handleMapClickReview();
              }}
              className="bg-gradient-to-br from-blue-600 to-blue-700"
            >
              Learn about the cultures, geography, and history of countries from around the world.
            </ActivityButton>
            <ActivityButton
              label="🏆 Quiz"
              onClick={() => {
                setActivityMode("quiz");
                handleMapClickQuiz();
              }}
              className="bg-gradient-to-br from-yellow-600 to-yellow-700"
            >
              Test your knowledge of countries around the world. Can you guess them all?
            </ActivityButton>
          </InstructionOverlay>

          <FloatingHeader shouldShow={!!activityMode} imageSrc={NerdMascot}>
            {activityMode === "quiz" && "Guess the country!"}
            {activityMode === "review" && "Reviewing countries"}
          </FloatingHeader>

          <QuizFloatingPanel
            shouldShow={activityMode === "quiz"}
            activity={{
              answerInputRef,
              submitAnswer,
              userGuessTally,
              giveHint,
              skipCountry,
            }}
            audio={{
              incorrectAnswerAudioSrc,
              correctAnswerAudioSrc,
            }}
          />

          <ReviewFloatingPanel
            shouldShow={activityMode === "review"}
            activity={{
              showNextCountry,
              isRandomReviewMode,
              setRandomReviewMode,
            }}
            disabled={filteredCountryData.length === 0}
            onError={setError}
          />

          {activityMode && filteredCountryData.length === 0 && <RegionsDisabledOverlay />}
        </div>

        {activityMode === "quiz" && <GuessHistoryPanel guessHistory={guessHistory} />}

        {activityMode === "review" && <CountriesListPanel />}
      </MainView>
    </>
  );
}
