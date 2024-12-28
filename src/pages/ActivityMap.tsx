import { useCallback, useEffect, useMemo, useRef } from "react";
import { Marker, Popup, ZoomControl } from "react-leaflet";
import { useSearchParams } from "react-router-dom";

import { ActivityButton, ActivitySection } from "src/components/activity/ActivityButton";
import CountriesListPanel from "src/components/activity/CountriesListPanel";
import FloatingHeader from "src/components/activity/FloatingHeader";
import GuessHistoryPanel from "src/components/activity/GuessHistoryPanel";
import InstructionOverlay from "src/components/activity/InstructionOverlay";
import QuizFloatingPanel from "src/components/activity/QuizFloatingPanel";
import RegionsToggleOverlay from "src/components/activity/RegionsToggle";
import ReviewFloatingPanel, {
  UnsplashImagesFloatingPanel,
  WikipediaFloatingPanel,
} from "src/components/activity/ReviewFloatingPanel";
import ErrorBanner from "src/components/common/ErrorBanner";
import MainView from "src/components/layout/MainView";
import { BackControl } from "src/components/map/BackControl";
import { LeafletMapFrame } from "src/components/map/LeafletMapFrame";
import type { SvgMapColorTheme } from "src/components/map/MapSvg";
import SvgMap from "src/components/map/MapSvg";
import { markerIcon } from "src/components/map/MarkerIcon";
import useActivityManager from "src/controllers/useActivityCoordinator";
import { useCountryFilters } from "src/hooks/useCountryFilters";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useError } from "src/hooks/useError";
import useHeaderController from "src/hooks/useHeaderController";
import { useMapActivity } from "src/hooks/useMapActivity";
import type { ActivityMode, ActivityType } from "src/hooks/useMapActivity/types";
import { useMapViewport } from "src/hooks/useMapViewport";
import { useUserGuessRecord } from "src/hooks/useUserGuessRecord";
import { cn } from "src/utils/styles";

import NerdMascot from "src/assets/images/mascot-nerd.min.svg";

const mapGradientStyle = {
  noActivity: "from-sky-700 to-sky-800 blur-sm",
  activity: "from-slate-900 to-slate-900 blur-none",
};

const mapActivityTheme: Map<ActivityMode | "default", SvgMapColorTheme> = new Map([
  [
    "review",
    {
      country: {
        activeStyle: "fill-slate-500/95 stroke-slate-400 hover:stroke-slate-300 hover:fill-slate-500",
        inactiveStyle: "fill-slate-800 stroke-none",
      },
    },
  ],
  [
    "quiz",
    {
      country: {
        activeStyle: "fill-slate-500/95 stroke-slate-400",
        inactiveStyle: "fill-slate-800 stroke-none",
      },
    },
  ],
  [
    "default",
    {
      country: {
        activeStyle: "fill-sky-700 stroke-none",
        inactiveStyle: "fill-sky-700 stroke-none",
      },
    },
  ],
]);

function shallowEqual(objA: Record<string, string>, objB: Record<string, string>): boolean {
  if (objA === objB) return true;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }

  return true;
}

type ActivityTransitionType = "start" | "finish" | "change";

function determineType(current: boolean, next: boolean): ActivityTransitionType {
  if (current && !next) return "finish";
  if (!current && next) return "start";
  return "change";
}

/**
 * Monitors changes in activity and triggers a callback when the activity type changes.
 *
 * @param onActivityChange Called when the activity type changes.
 * @returns The current activity.
 */
function useActivityMonitor(onActivityChange: (type: ActivityTransitionType) => void) {
  const { activity } = useMapActivity();
  const prevActivity = useRef<typeof activity | undefined>(undefined);

  useEffect(
    function activityMonitor() {
      if (prevActivity.current && activity && shallowEqual(prevActivity.current, activity)) return;
      if (!prevActivity.current && !activity) return;

      const type = determineType(Boolean(prevActivity.current), Boolean(activity));
      onActivityChange(type);

      prevActivity.current = activity;
    },
    [activity, onActivityChange],
  );

  return { activity };
}

function ActivityMap({
  setError,
  onFinishActivity,
}: {
  setError: (error: Error) => void;
  onFinishActivity: () => void;
}) {
  const { filteredCountryData } = useCountryFilters();
  const { storedCountry, resetStore } = useCountryStore();
  const { resetViewport: resetView } = useMapViewport({ options: { padding: 0 } });
  const {
    handleMapClick,
    visitedCountries,
    guessTally,
    giveHint,
    inputRef,
    nextCountry,
    submitAnswer,
    resetVisited,
    start,
    // finish,
  } = useActivityManager();

  const finishActivity = useCallback(() => {
    resetStore();
    resetView({ animate: false });
    // finish();
    onFinishActivity();
  }, [onFinishActivity, resetStore, resetView]);

  useHeaderController(finishActivity);

  const activityMonitorHandler = useCallback(
    (type: ActivityTransitionType) => {
      switch (type) {
        case "finish":
          finishActivity();
          break;
        case "start":
          start();
          break;
        case "change":
          break;
        default:
          throw new Error(`Unknown activity type: ${type}`);
      }
    },
    [finishActivity, start],
  );
  const { activity } = useActivityMonitor(activityMonitorHandler);

  const colorTheme = useMemo(() => mapActivityTheme.get(activity?.activity || "default")!, [activity]);

  return (
    <div
      className={cn("size-full bg-gradient-to-br", activity ? mapGradientStyle.activity : mapGradientStyle.noActivity)}
    >
      <LeafletMapFrame showControls={activity?.activity === "review"}>
        {activity && (
          <>
            <ZoomControl position="topright" />
            <BackControl position="topleft" label="Finish" onClick={finishActivity} />

            {storedCountry.coordinates && (
              <>
                {activity.activity !== "quiz" || activity.kind === "typing" ? (
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
                      <div className="text-xl italic">Unknown</div>
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
      />
      <WikipediaFloatingPanel
        disabled={filteredCountryData.length === 0}
        shouldShow={activity?.activity === "review" && filteredCountryData.length > 0}
        onError={setError}
      />
      <UnsplashImagesFloatingPanel
        disabled={filteredCountryData.length === 0}
        shouldShow={activity?.activity === "review" && filteredCountryData.length > 0}
        onError={setError}
      />
      {activity && <RegionsToggleOverlay shouldShow={filteredCountryData.length === 0} onStart={start} />}
    </div>
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
  const { guessHistory } = useUserGuessRecord();
  const { error, setError, dismissError } = useError();
  const [, setURLSearchParams] = useSearchParams();
  const { activity } = useMapActivity();

  const isActivitySelected = useMemo(() => !activity || !activity.activity, [activity]);

  return (
    <>
      {error && (
        <ErrorBanner error={error}>
          <ErrorBanner.Button dismissError={dismissError} />
        </ErrorBanner>
      )}

      <MainView className="relative overflow-auto">
        <InstructionOverlay shouldShow={isActivitySelected}>
          <ActivitySection>
            <ActivityButton
              className="bg-gradient-to-br from-blue-600 to-blue-700"
              label="🗺 Review"
              onClick={() => setURLSearchParams(activities["review-countries"])}
            >
              Learn the countries by region.
            </ActivityButton>
          </ActivitySection>
          <ActivitySection>
            <ActivityButton
              className="bg-gradient-to-br from-pink-600 to-pink-700"
              label="⌨ Typing Quiz"
              onClick={() => setURLSearchParams(activities["quiz-typing"])}
            >
              Type in the name of the country.
            </ActivityButton>
            <ActivityButton
              className="bg-gradient-to-br from-green-600 to-green-700"
              label="👆 Point & Click"
              onClick={() => setURLSearchParams(activities["quiz-pointing"])}
            >
              Point out the country on the map.
            </ActivityButton>
          </ActivitySection>
        </InstructionOverlay>

        <FloatingHeader shouldShow={!isActivitySelected} imageSrc={NerdMascot}>
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
