import { faBookAtlas, faKeyboard, faMousePointer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Marker, Popup, ZoomControl } from "react-leaflet";

import { ActivityButton } from "src/components/activity/ActivityButton";
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
import { useCountryStore } from "src/context/CountryStore";
import { useFilteredCountriesContext } from "src/context/FilteredCountryData";
import { useHeaderController } from "src/context/useHeaderController";
import useActivityManager from "src/controllers/useActivityCoordinator";
import { useError } from "src/hooks/common/useError";
import { useGuessRecord } from "src/hooks/useGuessRecord";
import { useMapActivity } from "src/hooks/useMapActivity";
import { useMapViewport } from "src/hooks/useMapViewport";
import type { ActivityMode, ActivityType } from "src/types/map-activity";
import { cn, tw } from "src/utils/styles";

import NerdMascot from "src/assets/images/mascot-nerd.min.svg";

const mapGradientStyle = {
  noActivity: tw`from-sky-700 to-sky-800 blur-sm`,
  activity: tw`from-slate-900 to-slate-900 blur-none`,
};

const reviewCountryStyle = {
  activeStyle: tw`fill-slate-500/95 stroke-slate-400 hover:fill-slate-500 hover:stroke-slate-300`,
  inactiveStyle: tw`fill-slate-800 stroke-none`,
};

const quizCountryStyle = {
  activeStyle: tw`fill-slate-500/95 stroke-slate-400`,
  inactiveStyle: tw`fill-slate-800 stroke-none`,
};

const defaultCountryStyle = {
  activeStyle: tw`fill-sky-700 stroke-none`,
  inactiveStyle: tw`fill-sky-700 stroke-none`,
};

const mapActivityTheme: Record<ActivityMode | "default", SvgMapColorTheme> = {
  review: { country: reviewCountryStyle },
  quiz: { country: quizCountryStyle },
  default: { country: defaultCountryStyle },
};

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

type ActivityEvent = "start" | "finish" | "change";

function determineEventType(current: boolean, next: boolean): ActivityEvent {
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
function useActivityMonitor(onActivityChange: (type: ActivityEvent) => void) {
  const { activity } = useMapActivity();
  const prevActivity = useRef<typeof activity | undefined>(undefined);

  useEffect(
    function activityMonitor() {
      if (prevActivity.current && activity && shallowEqual(prevActivity.current, activity)) return;
      if (!prevActivity.current && !activity) return;

      const eventType = determineEventType(Boolean(prevActivity.current), Boolean(activity));
      onActivityChange(eventType);

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
  const { filteredCountryData } = useFilteredCountriesContext();
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
  } = useActivityManager();

  const finishActivity = useCallback(() => {
    resetStore();
    resetView({ animate: false });
    onFinishActivity();
  }, [onFinishActivity, resetStore, resetView]);

  useHeaderController(finishActivity);

  const activityMonitorHandler = useCallback(
    (type: ActivityEvent) => {
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

  const colorTheme = useMemo(() => mapActivityTheme[activity?.activity || "default"], [activity]);

  const hasCountryData = useMemo(() => filteredCountryData.length > 0, [filteredCountryData]);

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

      {activity && (
        <AnimatePresence>
          {!hasCountryData && <RegionsToggleOverlay key="regions-toggle-overlay" onStart={start} />}

          {hasCountryData && activity.activity === "quiz" && (
            <QuizFloatingPanel
              key="quiz-floating-panel"
              mode={activity.kind}
              giveHint={giveHint}
              inputRef={inputRef}
              skipCountry={nextCountry}
              submitAnswer={submitAnswer}
              userGuessTally={guessTally}
            />
          )}

          {hasCountryData && activity.activity === "review" && (
            <>
              <ReviewFloatingPanel
                key="review-floating-panel"
                showNextCountry={nextCountry}
                disabled={!hasCountryData}
                onReset={resetVisited}
              />
              <WikipediaFloatingPanel key="wikipedia-floating-panel" onError={setError} />
              <UnsplashImagesFloatingPanel key="unsplash-floating-panel" onError={setError} />
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

const activities: Record<string, ActivityType> = {
  "review-countries": { activity: "review", kind: "countries" },
  "quiz-typing": { activity: "quiz", kind: "typing" },
  "quiz-pointing": { activity: "quiz", kind: "pointing" },
};

// Main activity layout view
export default function ActivityMapLayout() {
  const { guessHistory } = useGuessRecord();
  const { error, setError, dismissError } = useError();
  const { activity, setActivity } = useMapActivity();

  const isActivitySelected = !!activity?.activity;

  return (
    <>
      {error && (
        <ErrorBanner error={error}>
          <ErrorBanner.Button dismissError={dismissError} />
        </ErrorBanner>
      )}

      <MainView className="relative overflow-auto">
        <AnimatePresence>
          {!isActivitySelected && (
            <InstructionOverlay key="instruction-overlay">
              <section className="flex w-full min-w-max max-w-screen-sm flex-col items-center gap-8 p-6">
                <h1 className="text-2xl">Learn Geography</h1>
                <div className="flex flex-col shadow-lg">
                  <ActivityButton
                    type="review"
                    icon={<FontAwesomeIcon icon={faBookAtlas} />}
                    label="Review the map"
                    summary="Learn country names by region"
                    onClick={() => setActivity(activities["review-countries"])}
                  />
                </div>

                <h2 className="text-xl">And test your knowledge</h2>
                <div className="flex flex-col shadow-lg">
                  <ActivityButton
                    type="quiz"
                    icon={<FontAwesomeIcon icon={faMousePointer} />}
                    label="Point & click test"
                    summary="Point out the country on the map"
                    onClick={() => setActivity(activities["quiz-pointing"])}
                  />
                  <ActivityButton
                    type="quiz"
                    icon={<FontAwesomeIcon icon={faKeyboard} />}
                    label="Typing quiz"
                    summary="Type in the name of the country"
                    onClick={() => setActivity(activities["quiz-typing"])}
                  />
                </div>
              </section>
            </InstructionOverlay>
          )}

          {isActivitySelected && (
            <FloatingHeader key="floating-header" imageSrc={NerdMascot}>
              {activity?.activity === "quiz" && <span>Guess the country!</span>}
              {activity?.activity === "review" && <span>Reviewing countries</span>}
            </FloatingHeader>
          )}
        </AnimatePresence>

        <div className="relative m-2 flex-1 overflow-hidden rounded-lg shadow-inner">
          <ActivityMap onFinishActivity={() => setActivity(undefined)} setError={setError} />
        </div>

        {activity?.activity && (
          <motion.div className="flex h-1/5 w-max flex-col gap-6 overflow-y-auto sm:h-auto sm:w-[30ch]">
            <CountriesListPanel isAbridged={activity.activity === "quiz"} />
            {activity.activity === "quiz" && <GuessHistoryPanel guessHistory={guessHistory} />}
          </motion.div>
        )}
      </MainView>
    </>
  );
}
