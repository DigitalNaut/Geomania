import { useCallback } from "react";
import { Marker, ZoomControl, Popup } from "react-leaflet";
import { useSearchParams } from "react-router-dom";

import { BackControl, MapClick } from "src/components/map";
import { LeafletMap, markerIcon } from "src/components/map/LeafletMap";
import { useCountryQuiz } from "src/controllers/useCountryQuiz";
import { useError } from "src/hooks/useError";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useMapViewport } from "src/hooks/useMapViewport";
import { SvgMap } from "src/components/map/MapSvg";
import { ActivityButton } from "src/components/activity/ActivityButton";
import { useUserGuessRecordContext } from "src/contexts/GuessRecordContext";
import { useMapActivityContext } from "src/contexts/MapActivityContext";
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
import useHeaderController from "src/hooks/useHeaderController";

function MapActivity({
  setError,
  onFinishActivity,
}: {
  setError: (error: Error) => void;
  onFinishActivity: () => void;
}) {
  const { storedCountry, resetStore, filteredCountryData } = useCountryStore();
  const { showNextCountry, handleMapClick } = useActivityHelper(setError);
  const { answerInputRef, submitAnswer, userGuessTally, giveHint, skipCountry } = useCountryQuiz(
    showNextCountry,
    setError,
  );
  const { activityMode } = useMapActivityContext();
  const { resetView } = useMapViewport();

  const finishActivity = useCallback(() => {
    resetStore();
    resetView();
    onFinishActivity();
  }, [onFinishActivity, resetStore, resetView]);

  useHeaderController(finishActivity);

  return (
    <>
      <LeafletMap>
        {activityMode && (
          <>
            <ZoomControl position="topright" />
            <BackControl position="topleft" label="Finish" onClick={finishActivity} />
            <MapClick callback={handleMapClick} />
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
                  >
                    <h3 className="text-xl">{storedCountry.data?.name ?? "Unknown"}</h3>
                  </Popup>
                )}
              </>
            )}
          </>
        )}

        <SvgMap highlightAlpha3={storedCountry.data?.a3} onClick={handleMapClick} disableColorFilter={!activityMode} />
      </LeafletMap>

      <QuizFloatingPanel
        shouldShow={activityMode === "quiz" && filteredCountryData.length > 0}
        activity={{
          answerInputRef,
          submitAnswer,
          userGuessTally,
          giveHint,
          skipCountry,
        }}
      />

      <ReviewFloatingPanel
        shouldShow={activityMode === "review"}
        showNextCountry={showNextCountry}
        disabled={filteredCountryData.length === 0}
        onError={setError}
      />

      {activityMode && <RegionsDisabledOverlay shouldShow={filteredCountryData.length === 0} />}
    </>
  );
}

export default function MapActivityLayout() {
  const { guessHistory } = useUserGuessRecordContext();
  const { error, setError, dismissError } = useError();
  const [, setURLSearchParams] = useSearchParams();
  const { activityMode } = useMapActivityContext();

  return (
    <>
      {error && (
        <ErrorBanner error={error}>
          <ErrorBanner.Button dismissError={dismissError} />
        </ErrorBanner>
      )}

      <MainView>
        <div className="relative h-full w-full overflow-hidden rounded-lg shadow-inner">
          <MapActivity onFinishActivity={() => setURLSearchParams()} setError={setError} />

          <FloatingHeader shouldShow={!!activityMode} imageSrc={NerdMascot}>
            {activityMode === "quiz" && "Guess the country!"}
            {activityMode === "review" && "Reviewing countries"}
          </FloatingHeader>

          <InstructionOverlay shouldShow={!activityMode}>
            <ActivityButton
              className="bg-gradient-to-br from-blue-600 to-blue-700"
              label="🗺 Review"
              onClick={() => setURLSearchParams({ activity: "review" })}
            >
              Learn about the cultures, geography, and history of countries from around the world.
            </ActivityButton>
            <ActivityButton
              className="bg-gradient-to-br from-yellow-600 to-yellow-700"
              label="🏆 Quiz"
              onClick={() => setURLSearchParams({ activity: "quiz" })}
            >
              Test your knowledge of countries around the world. Can you guess them all?
            </ActivityButton>
          </InstructionOverlay>
        </div>

        {activityMode && (
          <div className="flex h-1/5 w-max flex-col gap-6 sm:h-auto sm:w-[30ch]">
            <CountriesListPanel isAbridged={activityMode === "quiz"} />
            {activityMode === "quiz" && <GuessHistoryPanel guessHistory={guessHistory} />}
          </div>
        )}
      </MainView>
    </>
  );
}
