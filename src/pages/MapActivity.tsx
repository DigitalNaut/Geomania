import { useRef } from "react";
import { Marker, ZoomControl, Popup } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { BackControl, MapClick, TileLayersControl } from "src/components/map";
import { LeafletMap, markerIcon } from "src/components/map/LeafletMap";
import { useCountryQuiz } from "src/controllers/useCountryQuiz";
import { useCountryReview } from "src/controllers/useCountryReview";
import { useError } from "src/hooks/useError";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useMapViewport } from "src/hooks/useMapViewport";
import { SvgMap } from "src/components/map/MapSvg";
import { ActivityButton } from "src/components/activity/ActivityButton";
import GuessHistoryPanel from "src/components/activity/GuessHistoryPanel";
import QuizFloatingPanel from "src/components/activity/QuizFloatingPanel";
import ReviewFloatingPanel from "src/components/activity/ReviewFloatingPanel";
import FloatingHeader from "src/components/activity/FloatingHeader";
import InstructionOverlay from "src/components/activity/InstructionOverlay";
import MainView from "src/components/layout/MainView";
import NerdMascot from "src/assets/images/mascot-nerd.min.svg";
import CountriesListPanel from "src/components/activity/CountriesListPanel";

type ActivityMode = "review" | "quiz";

const incorrectAnswerAudioSrc = new URL("src/assets/sounds/incorrect.mp3", import.meta.url);
const correctAnswerAudioSrc = new URL("src/assets/sounds/correct.mp3", import.meta.url);

function useActivityMode() {
  const activityMode = useRef<ActivityMode>();

  const chooseActivity = (activity: ActivityMode, callback: () => void) => {
    activityMode.current = activity;
    callback();
  };

  return { activityMode, chooseActivity };
}

function ErrorBanner({ error, dismissError }: { error: Error; dismissError: () => void }) {
  return (
    <div className="flex w-full flex-[0] justify-center bg-red-800 p-2">
      <div className="flex gap-6">
        {error.message}
        <button role="button" title="Dismiss" onClick={dismissError}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
}

export default function MapActivity() {
  const { error, setError, dismissError } = useError();
  const { activityMode, chooseActivity } = useActivityMode();
  const countryStore = useCountryStore();
  const { storedCountry, resetStore, filteredCountryData } = countryStore;

  const {
    handleMapClick: handleMapClickReview,
    showNextCountry,
    isRandomReviewMode,
    setRandomReviewMode,
  } = useCountryReview(countryStore, setError);
  const {
    answerInputRef,
    submitAnswer,
    userGuessTally,
    giveHint,
    guessHistory,
    skipCountry,
    handleMapClick: handleMapClickQuiz,
  } = useCountryQuiz(countryStore, setError);

  const { resetView } = useMapViewport();
  const finishActivity = () => {
    activityMode.current = undefined;
    resetStore();
    resetView();
  };

  return (
    <>
      {error && <ErrorBanner error={error} dismissError={dismissError} />}

      <MainView>
        <div className="relative h-full w-full overflow-hidden rounded-lg shadow-inner">
          <LeafletMap>
            {activityMode.current && (
              <>
                <TileLayersControl />

                <ZoomControl position="topright" />

                <BackControl position="topleft" label="Finish" onClick={finishActivity} />
              </>
            )}

            {storedCountry.coordinates && (
              <>
                <Marker position={storedCountry.coordinates} icon={markerIcon} />
                {activityMode.current === "review" && (
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

            {activityMode.current === "quiz" && <MapClick callback={handleMapClickQuiz} />}

            <SvgMap
              highlightAlpha3={storedCountry.data?.alpha3}
              onClick={handleMapClickReview}
              enableOnClick={activityMode.current === "review"}
            />
          </LeafletMap>

          <InstructionOverlay shouldShow={!activityMode.current}>
            <ActivityButton
              label="🗺 Review"
              onClick={() => chooseActivity("review", handleMapClickReview)}
              className="bg-gradient-to-br from-blue-600 to-blue-700"
            >
              Learn about the cultures, geography, and history of countries from around the world.
            </ActivityButton>
            <ActivityButton
              label="🏆 Quiz"
              onClick={() => chooseActivity("quiz", handleMapClickQuiz)}
              className="bg-gradient-to-br from-yellow-600 to-yellow-700"
            >
              Test your knowledge of countries around the world. Can you guess them all?
            </ActivityButton>
          </InstructionOverlay>

          <FloatingHeader shouldShow={!!activityMode.current} imageSrc={NerdMascot}>
            {activityMode.current === "quiz" && "Guess the country!"}
            {activityMode.current === "review" && "Reviewing countries"}
          </FloatingHeader>

          <QuizFloatingPanel
            shouldShow={activityMode.current === "quiz"}
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
            shouldShow={activityMode.current === "review"}
            activity={{
              showNextCountry,
              isRandomReviewMode,
              setRandomReviewMode,
            }}
            disabled={filteredCountryData.length === 0}
            onError={setError}
          />
        </div>

        {activityMode.current === "quiz" && <GuessHistoryPanel guessHistory={guessHistory} />}

        {activityMode.current === "review" && <CountriesListPanel />}
      </MainView>
    </>
  );
}
