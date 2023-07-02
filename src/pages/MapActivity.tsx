import type { Layer, LeafletMouseEventHandlerFn } from "leaflet";
import type { PropsWithChildren } from "react";
import { useRef } from "react";
import { Marker, GeoJSON, ZoomControl, Popup } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";

import { MapClick } from "src/components/activity/MapClick";
import { LeafletMap, markerIcon } from "src/components/activity/LeafletMap";
import { useCountryQuiz } from "src/controllers/useCountryQuiz";
import { useCountryReview } from "src/controllers/useCountryReview";
import { useError } from "src/hooks/useError";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useMapControl } from "src/hooks/useMapControl";
import GuessHistoryPanel from "src/components/activity/GuessHistoryPanel";
import QuizFloatingPanel from "src/components/activity/QuizFloatingPanel";
import ReviewFloatingPanel from "src/components/activity/ReviewFloatingPanel";
import FloatingHeader from "src/components/activity/FloatingHeader";
import InstructionOverlay from "src/components/activity/InstructionOverlay";
import MainView from "src/components/layout/MainView";
import NerdMascot from "src/assets/images/mascot-nerd.min.svg";
import CountriesListPanel from "src/components/activity/CountriesListPanel";

function ActivityButton({
  label,
  children,
  onClick,
  className,
}: PropsWithChildren<{
  label: string;
  onClick: () => void;
  className?: string;
}>) {
  return (
    <button
      role="button"
      className="w-full flex-1 items-center justify-center gap-3 hover:bg-white/10"
      onClick={onClick}
    >
      <div
        className={`m-auto flex w-fit items-center gap-4 rounded-lg p-6 shadow-lg ${className}`}
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl">{label}</h2>
          <p className="inline-block max-w-[40ch] text-base">{children}</p>
        </div>
        <FontAwesomeIcon icon={faChevronRight} />
      </div>
    </button>
  );
}

type ActivityMode = "review" | "quiz";

function useActivityMode() {
  const activityMode = useRef<ActivityMode>();

  const chooseActivity = (activity: ActivityMode, callback: () => void) => {
    activityMode.current = activity;
    callback();
  };

  return { activityMode, chooseActivity };
}

export default function MapActivity() {
  const { error, setError, dismissError } = useError();
  const { activityMode, chooseActivity } = useActivityMode();
  const countryStore = useCountryStore();
  const { storedCountry, resetStore, allCountryFeatures, filteredCountryData } =
    countryStore;

  const mapControl = useMapControl();
  const { resetView } = mapControl;
  const {
    handleMapClick: handleMapClickReview,
    showNextCountry,
    isRandomReviewMode,
    setRandomReviewMode,
  } = useCountryReview(countryStore, mapControl, setError);
  const {
    answerInputRef,
    submitAnswer,
    userGuessTally,
    giveHint,
    guessHistory,
    skipCountry,
    handleMapClick: handleMapClickQuiz,
  } = useCountryQuiz(countryStore, mapControl, setError);

  const finishActivity = () => {
    activityMode.current = undefined;
    resetStore();
    resetView();
  };

  const handleFeatureClick: LeafletMouseEventHandlerFn = (event) =>
    activityMode.current === "review" &&
    handleMapClickReview(event.target.feature.properties.ISO_A3);

  const onEachFeature = (_feature: unknown, layer: Layer) => {
    layer.on({ click: handleFeatureClick });
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
          <LeafletMap isActivityMode={!!activityMode.current}>
            {!!activityMode.current && <ZoomControl />}

            {storedCountry.coordinates && (
              <>
                <Marker
                  position={storedCountry.coordinates}
                  icon={markerIcon}
                />
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
                        console.log(
                          "Popup removed, please provide an alternative place to display the country name"
                        ),
                    }}
                  >
                    <h3 className="text-xl">{storedCountry.data?.name}</h3>
                  </Popup>
                )}
              </>
            )}

            <GeoJSON
              data={allCountryFeatures}
              style={(feature) => ({
                fillColor:
                  feature?.properties?.ISO_A3 === storedCountry.data?.alpha3
                    ? "#fcd34d"
                    : "#94a3b8",
                fillOpacity: 1,
                color: "white",
                weight: 1,
              })}
              onEachFeature={onEachFeature}
            />

            {activityMode.current === "quiz" && (
              <MapClick callback={handleMapClickQuiz} />
            )}
          </LeafletMap>

          <InstructionOverlay shouldShow={!activityMode.current}>
            <ActivityButton
              label="🗺 Review"
              onClick={() => chooseActivity("review", handleMapClickReview)}
              className="bg-gradient-to-br from-blue-600 to-blue-700"
            >
              Learn about the cultures, geography, and history of countries from
              around the world.
            </ActivityButton>
            <ActivityButton
              label="🏆 Quiz"
              onClick={() => chooseActivity("quiz", handleMapClickQuiz)}
              className="bg-gradient-to-br from-yellow-600 to-yellow-700"
            >
              Test your knowledge of countries around the world. Can you guess
              them all?
            </ActivityButton>
          </InstructionOverlay>

          <FloatingHeader
            shouldShow={!!activityMode.current}
            imageSrc={NerdMascot}
            button={{
              label: "Finish",
              onClick: finishActivity,
            }}
          >
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
              incorrectAnswerAudioSrc: "src/assets/sounds/incorrect.mp3",
              correctAnswerAudioSrc: "src/assets/sounds/correct.mp3",
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
          />
        </div>

        {activityMode.current === "quiz" && (
          <GuessHistoryPanel guessHistory={guessHistory} />
        )}

        {activityMode.current === "review" && <CountriesListPanel />}
      </MainView>
    </>
  );
}
