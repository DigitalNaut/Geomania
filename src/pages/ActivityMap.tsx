import { Marker, ZoomControl, Popup } from "react-leaflet";
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { ActivityButton, ActivitySection } from "src/components/activity/ActivityButton";
import { BackControl } from "src/components/map/BackControl";
import { LeafletMap } from "src/components/map/LeafletMap";
import { markerIcon } from "src/components/map/MarkerIcon";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useError } from "src/hooks/useError";
import { useMapActivityContext } from "src/contexts/MapActivityContext";
import { useMapViewport } from "src/hooks/useMapViewport";
import { useUserGuessRecordContext } from "src/contexts/GuessRecordContext";
import CountriesListPanel from "src/components/activity/CountriesListPanel";
import ErrorBanner from "src/components/common/ErrorBanner";
import FloatingHeader from "src/components/activity/FloatingHeader";
import GuessHistoryPanel from "src/components/activity/GuessHistoryPanel";
import InstructionOverlay from "src/components/activity/InstructionOverlay";
import MainView from "src/components/layout/MainView";
import QuizFloatingPanel from "src/components/activity/QuizFloatingPanel";
import RegionsDisabledOverlay from "src/components/activity/RegionsToggle";
import ReviewFloatingPanel from "src/components/activity/ReviewFloatingPanel";
import SvgMap from "src/components/map/MapSvg";
import useActivityCoordinator from "src/controllers/useActivityCoordinator";

import { useCountryFiltersContext } from "src/contexts/CountryFiltersContext";
import NerdMascot from "src/assets/images/mascot-nerd.min.svg";
import useHeaderController from "src/hooks/useHeaderController";
import { useMemo } from "react";

function MapActivity({
  setError,
  onFinishActivity,
}: {
  setError: (error: Error) => void;
  onFinishActivity: () => void;
}) {
  const { filteredCountryData } = useCountryFiltersContext();
  const { storedCountry, resetStore } = useCountryStore();
  const { activity } = useMapActivityContext();
  const { resetView } = useMapViewport({ options: { padding: 0.5 } });
  const { handleMapClick, visitedCountries, guessTally, giveHint, inputRef, nextCountry, submitAnswer, resetVisited } =
    useActivityCoordinator();

  const finishActivity = useCallback(() => {
    resetStore();
    resetView();
    onFinishActivity();
  }, [onFinishActivity, resetStore, resetView]);

  useHeaderController(finishActivity);

  return (
    <>
      <LeafletMap showTileLayers={activity?.mode === "review"}>
        {activity && (
          <>
            <ZoomControl position="topright" />
            <BackControl position="topleft" label="Finish" onClick={finishActivity} />

            {storedCountry.coordinates && (
              <>
                {activity?.mode !== "quiz" || activity.kind === "typing" ? (
                  <Marker position={storedCountry.coordinates} icon={markerIcon} />
                ) : null}

                {activity.mode === "review" && (
                  <Popup
                    position={storedCountry.coordinates}
                    keepInView
                    closeButton
                    autoClose={false}
                    closeOnClick={false}
                    closeOnEscapeKey={false}
                    autoPan={false}
                  >
                    {storedCountry.data ? (
                      <div className="flex flex-col justify-center gap-1 text-center">
                        <h2 className="text-xl">{storedCountry.data.GEOUNIT}</h2>
                        {storedCountry.data.ADM0_DIF || storedCountry.data.GEOU_DIF ? (
                          <h3 className="text-sm">({storedCountry.data.SOVEREIGNT})</h3>
                        ) : null}
                      </div>
                    ) : (
                      "Unknown"
                    )}
                  </Popup>
                )}
              </>
            )}
          </>
        )}

        <SvgMap selectedPaths={visitedCountries} onClick={handleMapClick} disableColorFilter={!activity} />
      </LeafletMap>

      <QuizFloatingPanel
        shouldShow={activity?.mode === "quiz" && filteredCountryData.length > 0}
        mode={activity?.mode === "quiz" ? activity.kind : undefined}
        giveHint={giveHint}
        inputRef={inputRef}
        skipCountry={nextCountry}
        submitAnswer={submitAnswer}
        userGuessTally={guessTally}
      />

      <ReviewFloatingPanel
        shouldShow={activity?.mode === "review"}
        showNextCountry={nextCountry}
        disabled={filteredCountryData.length === 0}
        onReset={resetVisited}
        onError={setError}
      />

      {activity && <RegionsDisabledOverlay shouldShow={filteredCountryData.length === 0} />}
    </>
  );
}

type ActivityType =
  | {
      activity: "quiz";
      kind: "typing" | "pointing";
    }
  | {
      activity: "review";
      kind: "countries";
    }
  | undefined;

type Activities = { [key: string]: ActivityType };

const activities: Activities = {
  "review-countries": { activity: "review", kind: "countries" },
  "quiz-typing": { activity: "quiz", kind: "typing" },
  "quiz-pointing": { activity: "quiz", kind: "pointing" },
};

// Main activity layout view
export default function ActivityMapLayout() {
  const { guessHistory } = useUserGuessRecordContext();
  const { error, setError, dismissError } = useError();
  const [, setURLSearchParams] = useSearchParams();
  const { activity } = useMapActivityContext();

  const isActivityModeUndefined = useMemo(() => !activity || !activity.mode, [activity, activity?.mode]);

  return (
    <>
      {error && (
        <ErrorBanner error={error}>
          <ErrorBanner.Button dismissError={dismissError} />
        </ErrorBanner>
      )}

      <MainView>
        <div className="relative size-full rounded-lg shadow-inner [overflow:clip]">
          <MapActivity onFinishActivity={() => setURLSearchParams(undefined)} setError={setError} />

          <FloatingHeader shouldShow={!isActivityModeUndefined} imageSrc={NerdMascot}>
            {activity?.mode === "quiz" && "Guess the country!"}
            {activity?.mode === "review" && "Reviewing countries"}
          </FloatingHeader>

          <InstructionOverlay shouldShow={isActivityModeUndefined}>
            <ActivitySection>
              <ActivityButton
                className="bg-gradient-to-br from-blue-600 to-blue-700"
                label="🗺 Review"
                onClick={() => setURLSearchParams(activities["review-countries"])}
              >
                Learn about the cultures, geography, and history of countries from around the world.
              </ActivityButton>
            </ActivitySection>
            <ActivitySection>
              <ActivityButton
                className="bg-gradient-to-br from-pink-600 to-pink-700"
                label="⌨ Typing Quiz"
                onClick={() => setURLSearchParams(activities["quiz-typing"])}
              >
                Type the name of the country.
              </ActivityButton>
              <ActivityButton
                className="bg-gradient-to-br from-green-600 to-green-700"
                label="👆 Choosing Quiz"
                onClick={() => setURLSearchParams(activities["quiz-pointing"])}
              >
                Choose the correct country on the map.
              </ActivityButton>
            </ActivitySection>
          </InstructionOverlay>
        </div>

        {activity?.mode && (
          <div className="flex h-1/5 w-max flex-col gap-6 sm:h-auto sm:w-[30ch]">
            <CountriesListPanel isAbridged={activity.mode === "quiz"} />
            {activity.mode === "quiz" && <GuessHistoryPanel guessHistory={guessHistory} />}
          </div>
        )}
      </MainView>
    </>
  );
}
