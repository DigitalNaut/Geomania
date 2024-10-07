import { useCallback, useMemo } from "react";
import { Marker, Popup, ZoomControl } from "react-leaflet";
import { useSearchParams } from "react-router-dom";

import { ActivityButton, ActivitySection } from "src/components/activity/ActivityButton";
import CountriesListPanel from "src/components/activity/CountriesListPanel";
import FloatingHeader from "src/components/activity/FloatingHeader";
import GuessHistoryPanel from "src/components/activity/GuessHistoryPanel";
import InstructionOverlay from "src/components/activity/InstructionOverlay";
import QuizFloatingPanel from "src/components/activity/QuizFloatingPanel";
import RegionsDisabledOverlay from "src/components/activity/RegionsToggle";
import ReviewFloatingPanel from "src/components/activity/ReviewFloatingPanel";
import ErrorBanner from "src/components/common/ErrorBanner";
import MainView from "src/components/layout/MainView";
import { BackControl } from "src/components/map/BackControl";
import { LeafletMapFrame } from "src/components/map/LeafletMapFrame";
import type { SvgMapColorTheme } from "src/components/map/MapSvg";
import SvgMap from "src/components/map/MapSvg";
import { markerIcon } from "src/components/map/MarkerIcon";
import { useCountryFiltersContext } from "src/contexts/CountryFiltersContext";
import { useUserGuessRecordContext } from "src/contexts/GuessRecordContext";
import type { ActivityType } from "src/contexts/MapActivityContext";
import { useMapActivityContext } from "src/contexts/MapActivityContext";
import useActivityCoordinator from "src/controllers/useActivityCoordinator";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useError } from "src/hooks/useError";
import useHeaderController from "src/hooks/useHeaderController";
import { useMapViewport } from "src/hooks/useMapViewport";

import NerdMascot from "src/assets/images/mascot-nerd.min.svg";

const mapActivityTheme: Map<ActivityType["activity"] | "default", SvgMapColorTheme> = new Map([
  [
    "review",
    {
      country: {
        active: { fill: "#0241637F", stroke: "#FFFFFF2F" },
        inactive: { fill: "#0241633F", stroke: "#FFFFFF00" },
      },
    },
  ],
  [
    "quiz",
    {
      country: {
        active: { fill: "#FFFFFF2F", stroke: "#FFFFFF1F" },
        inactive: { fill: "#4755693F", stroke: "#FFFFFF00" },
      },
    },
  ],
  [
    "default",
    {
      country: {
        active: { fill: "#0241633F", stroke: "#FFFFFF00" },
        inactive: { fill: "#0241631F", stroke: "#FFFFFF00" },
      },
    },
  ],
]);

function ActivityMap({
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

  const colorTheme = useMemo(() => mapActivityTheme.get(activity?.activity || "default")!, [activity]);

  return (
    <>
      <LeafletMapFrame showControls={activity?.activity === "review"}>
        {activity && (
          <>
            <ZoomControl position="topright" />
            <BackControl position="topleft" label="Finish" onClick={finishActivity} />

            {storedCountry.coordinates && (
              <>
                {activity?.activity !== "quiz" || activity.kind === "typing" ? (
                  <Marker position={storedCountry.coordinates} icon={markerIcon} />
                ) : null}

                {activity.activity === "review" && (
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

        <SvgMap selectedPaths={visitedCountries} onClick={handleMapClick} colorTheme={colorTheme} />
      </LeafletMapFrame>

      <QuizFloatingPanel
        shouldShow={activity?.activity === "quiz" && filteredCountryData.length > 0}
        mode={activity?.activity === "quiz" ? activity.kind : undefined}
        giveHint={giveHint}
        inputRef={inputRef}
        skipCountry={nextCountry}
        submitAnswer={submitAnswer}
        userGuessTally={guessTally}
      />

      <ReviewFloatingPanel
        shouldShow={activity?.activity === "review"}
        showNextCountry={nextCountry}
        disabled={filteredCountryData.length === 0}
        onReset={resetVisited}
        onError={setError}
      />

      {activity && <RegionsDisabledOverlay shouldShow={filteredCountryData.length === 0} />}
    </>
  );
}

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

  const isActivityModeUndefined = useMemo(() => !activity || !activity.activity, [activity]);

  return (
    <>
      {error && (
        <ErrorBanner error={error}>
          <ErrorBanner.Button dismissError={dismissError} />
        </ErrorBanner>
      )}

      <MainView className="relative overflow-auto">
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
              label="👆 Point & Click"
              onClick={() => setURLSearchParams(activities["quiz-pointing"])}
            >
              Choose the correct country on the map.
            </ActivityButton>
          </ActivitySection>
        </InstructionOverlay>

        <FloatingHeader shouldShow={!isActivityModeUndefined} imageSrc={NerdMascot}>
          {activity?.activity === "quiz" && <span>Guess the country!</span>}
          {activity?.activity === "review" && <span>Reviewing countries</span>}
        </FloatingHeader>

        <div className="relative m-2 flex-1 overflow-hidden rounded-lg shadow-inner">
          <ActivityMap onFinishActivity={() => setURLSearchParams(undefined)} setError={setError} />
        </div>

        {activity?.activity && (
          <div className="flex h-1/5 w-max flex-col gap-6 overflow-y-auto sm:h-auto sm:w-[30ch]">
            <CountriesListPanel isAbridged={activity.activity === "quiz"} />
            {activity.activity === "quiz" && <GuessHistoryPanel guessHistory={guessHistory} />}
          </div>
        )}
      </MainView>
    </>
  );
}
