import { useRef } from "react";
import { Marker, ZoomControl, Popup } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import {
  BackControl,
  MapClick,
  TileLayersControl,
} from "src/components/activity/mapControls";
import { LeafletMap, markerIcon } from "src/components/activity/LeafletMap";
import { useCountryQuiz } from "src/controllers/useCountryQuiz";
import { useCountryReview } from "src/controllers/useCountryReview";
import { useError } from "src/hooks/useError";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useMapViewport } from "src/hooks/useMapViewport";
import { SvgMap, svgPaths } from "src/components/activity/MapSvg";
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
  // const { storedCountry, resetStore, allCountryFeatures, filteredCountryData } =
  const { storedCountry, resetStore, filteredCountryData } = countryStore;

  const mapControl = useMapViewport();
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
            {!!activityMode.current && (
              <>
                <TileLayersControl />

                <ZoomControl position="topright" />

                <BackControl
                  position="topleft"
                  label="Finish"
                  onClick={finishActivity}
                />
              </>
            )}

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
                          "Popup removed, please provide an alternative place to display the country name",
                        ),
                    }}
                  >
                    <h3 className="text-xl">{storedCountry.data?.name}</h3>
                  </Popup>
                )}
              </>
            )}

            <SvgMap
              eventHandlers={{
                click: ({ originalEvent }) => {
                  if (activityMode.current !== "review") return;

                  if (
                    originalEvent.target &&
                    "id" in originalEvent.target &&
                    typeof originalEvent.target.id === "string"
                  )
                    handleMapClickReview(originalEvent.target.id);
                },
              }}
            >
              {(zoom) => (
                <>
                  {svgPaths.map((item, index) => (
                    <path
                      key={index}
                      id={item.a3}
                      d={item.path}
                      style={{
                        stroke:
                          item.a3 === storedCountry.data?.alpha3
                            ? "#fcd34d"
                            : "unset",
                        fill:
                          item.a3 === storedCountry.data?.alpha3
                            ? "#fcd34d"
                            : "#94a3b8",
                        strokeWidth: 1 / zoom ** 2,
                      }}
                    />
                  ))}
                </>
              )}
            </SvgMap>

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
