import type { Layer, LeafletMouseEventHandlerFn } from "leaflet";
import { useRef, useMemo } from "react";
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

export default function MapActivity() {
  const { error, setError, dismissError } = useError();
  const activityMode = useRef<"review" | "quiz">();
  const countryStore = useCountryStore();
  const { storedCountry, resetStore } = countryStore;

  const mapControl = useMapControl({});
  const { resetView } = mapControl;
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

  const storeHasData = useMemo(
    () => !!(storedCountry.data && storedCountry.feature),
    [storedCountry]
  );

  const allCountryFeatures = useMemo(() => getAllCountryFeatures(), []);

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

  const chooseActivity = (activity: "review" | "quiz") => {
    activityMode.current = activity;
    handleMapClickReview();
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
          <LeafletMap isActivityMode={storeHasData}>
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
            <button
              role="button"
              className="w-full flex-1 items-center justify-center gap-3 hover:bg-white/10"
              onClick={() => chooseActivity("review")}
            >
              <div className="m-auto flex w-fit items-center gap-4 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-6 shadow-lg">
                <div className="flex flex-col gap-4">
                  <h2 className="text-2xl">🗺 Review</h2>
                  <p className="inline-block max-w-[40ch] text-base">
                    Learn about the cultures, geography, and history of
                    countries from around the world.
                  </p>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </button>
            <button
              role="button"
              className="w-full flex-1 items-center justify-center gap-3 hover:bg-white/10"
              onClick={() => chooseActivity("quiz")}
            >
              <div className="m-auto flex w-fit items-center gap-4 rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 shadow-lg">
                <div className="flex flex-col gap-4">
                  <h2 className="text-2xl">📝 Practice</h2>
                  <p className="inline-block max-w-[40ch] text-base">
                    Test your knowledge of countries with this fun guessing
                    game. Can you guess them all?
                  </p>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </button>
          </InstructionOverlay>

          <FloatingHeader
            shouldShow={!!activityMode.current && storeHasData}
            imageSrc={NerdMascot}
            button={{
              label: "Finish",
              onClick: finishActivity,
            }}
          >
            {activityMode.current === "quiz" && "Guess the country!"}
            {activityMode.current === "review" && "Reviewing countries"}
          </FloatingHeader>

          <UserGuessFloatingPanel
            shouldShow={storeHasData && activityMode.current === "quiz"}
            activity={{
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
            shouldShow={storeHasData && activityMode.current === "review"}
            activity={{
              showNextCountry,
            }}
          />
        </div>

        <GuessHistoryPanel guessHistory={guessHistory} />
      </MainView>
    </>
  );
}
