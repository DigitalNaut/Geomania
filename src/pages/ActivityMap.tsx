import { faBookAtlas, faKeyboard, faMousePointer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo } from "react";
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
import { useActivityCoordinatorContext } from "src/context/ActivityCoordinator/hook";
import { useMapActivityContext } from "src/context/MapActivity/hook";
import { useHeaderController } from "src/context/useHeaderController";
import { useError } from "src/hooks/common/useError";
import { useGuessRecord } from "src/hooks/useGuessRecord";
import { useMapViewport } from "src/hooks/useMapViewport";
import { countriesByContinent, newQueue } from "src/store/CountryStore/slice";
import type { ActivityMode, ActivityType } from "src/types/map-activity";
import { getLabelCoordinates } from "src/utils/features";
import { cn, tw } from "src/utils/styles";

import NerdMascot from "src/assets/images/mascot-nerd.min.svg";
import { useAppDispatch } from "src/store/hooks";

const mapGradientStyle = {
  noActivity: tw`from-sky-700 to-sky-800 blur-sm`,
  activity: tw`from-slate-900 to-slate-900 blur-none`,
};

const reviewCountryStyle: SvgMapColorTheme["country"] = {
  activeStyle: tw`fill-slate-500/95 stroke-slate-400 hover:fill-slate-500 hover:stroke-slate-300`,
  highlightStyle: tw`fill-lime-500 stroke-lime-200`,
  visitedStyle: tw`fill-lime-700 stroke-lime-200`,
  inactiveStyle: tw`fill-slate-800 stroke-none`,
};

const quizCountryStyle: SvgMapColorTheme["country"] = {
  activeStyle: tw`fill-slate-500/95 stroke-slate-400`,
  highlightStyle: tw`fill-lime-500 stroke-lime-200`,
  visitedStyle: tw`fill-lime-700 stroke-lime-200`,
  inactiveStyle: tw`fill-slate-800 stroke-none`,
};

const defaultCountryStyle: SvgMapColorTheme["country"] = {
  activeStyle: tw`fill-sky-700 stroke-none`,
  highlightStyle: "",
  visitedStyle: "",
  inactiveStyle: tw`fill-sky-700 stroke-none`,
};

const mapActivityTheme: Record<ActivityMode | "default", SvgMapColorTheme> = {
  review: { country: reviewCountryStyle },
  quiz: { country: quizCountryStyle },
  default: { country: defaultCountryStyle },
};

function ActivityMap({
  setError,
  onFinishActivity,
}: {
  setError: (error: Error) => void;
  onFinishActivity: () => void;
}) {
  const { resetViewport } = useMapViewport();
  const {
    currentActivityState,
    handleMapClick,
    visitedCountries: visitedList,
    guessTally,
    giveHint,
    inputRef,
    nextCountry,
    submitAnswer,
    start,
    reset,
  } = useActivityCoordinatorContext();

  const { currentContinent, currentCountry } = currentActivityState ?? {};

  const storedCountryCoordinates = useMemo(
    () => (currentCountry ? getLabelCoordinates(currentCountry) : null),
    [currentCountry],
  );

  const finishActivity = useCallback(() => {
    onFinishActivity();
    resetViewport();
  }, [onFinishActivity, resetViewport]);

  useHeaderController(finishActivity);

  const { activity } = useMapActivityContext();

  const colorTheme = useMemo(() => mapActivityTheme[activity?.activity || "default"], [activity]);

  const activeList = useMemo(() => {
    if (!currentContinent) return [];

    return countriesByContinent[currentContinent].slice();
  }, [currentContinent]);

  const dispatch = useAppDispatch();

  const handleSelectRegion = (id: string) => {
    if (!activity) return;

    dispatch(
      newQueue({
        activityType: activity.activity,
        continent: id,
        shuffle: false,
        blacklistedCountries: [],
      }),
    );

    start();
  };

  return (
    <div
      className={cn("size-full bg-gradient-to-br", activity ? mapGradientStyle.activity : mapGradientStyle.noActivity)}
    >
      <LeafletMapFrame showControls={activity?.activity === "review"}>
        {activity && (
          <>
            <ZoomControl position="topright" />
            <BackControl position="topleft" label="Finish" onClick={finishActivity} />

            {storedCountryCoordinates && (
              <>
                {activity.activity !== "quiz" || activity.kind === "typing" ? (
                  <Marker position={storedCountryCoordinates} icon={markerIcon} />
                ) : null}

                {activity.activity === "review" && (
                  <Popup
                    position={storedCountryCoordinates}
                    keepInView
                    closeButton
                    autoClose={false}
                    closeOnClick={false}
                    closeOnEscapeKey={false}
                    autoPan={false}
                  >
                    {currentCountry ? (
                      <div className="flex flex-col justify-center gap-1 text-center">
                        <h2 className="text-xl">{currentCountry.GEOUNIT}</h2>
                        {currentCountry.ADM0_DIF || currentCountry.GEOU_DIF ? (
                          <h3 className="text-sm">({currentCountry.SOVEREIGNT})</h3>
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

        <SvgMap
          lists={{
            activeList,
            visitedList,
            highlightList: [],
            inactiveList: [],
          }}
          onClick={handleMapClick}
          colorTheme={colorTheme}
        />
      </LeafletMapFrame>

      {activity && (
        <AnimatePresence>
          {!currentCountry && <RegionsToggleOverlay key="regions-toggle-overlay" onClick={handleSelectRegion} />}

          {currentCountry && activity.activity === "quiz" && (
            <QuizFloatingPanel
              key="quiz-floating-panel"
              mode={activity.kind}
              giveHint={giveHint}
              inputRef={inputRef}
              skipCountry={nextCountry}
              submitAnswer={submitAnswer}
              userGuessTally={guessTally}
              onReset={reset}
            />
          )}

          {currentCountry && activity.activity === "review" && (
            <>
              <ReviewFloatingPanel
                key="review-floating-panel"
                showNextCountry={nextCountry}
                disabled={!currentCountry}
                onReset={reset}
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
  const { activity, navigateToActivity } = useMapActivityContext();

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
                    onClick={() => {
                      navigateToActivity(activities["review-countries"]);
                    }}
                  />
                </div>

                <h2 className="text-xl">And test your knowledge</h2>
                <div className="flex flex-col shadow-lg">
                  <ActivityButton
                    type="quiz"
                    icon={<FontAwesomeIcon icon={faMousePointer} />}
                    label="Point & click"
                    summary="Point out the country on the map"
                    onClick={() => {
                      navigateToActivity(activities["quiz-pointing"]);
                    }}
                  />
                  <ActivityButton
                    type="quiz"
                    icon={<FontAwesomeIcon icon={faKeyboard} />}
                    label="Typing quiz"
                    summary="Type in the name of the country"
                    onClick={() => {
                      navigateToActivity(activities["quiz-typing"]);
                    }}
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
          <ActivityMap onFinishActivity={() => navigateToActivity(null)} setError={setError} />
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
