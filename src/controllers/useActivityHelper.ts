import { useCallback, useEffect } from "react";
import { type CountryData, getCountryCoordinates, useCountryStore } from "src/hooks/useCountryStore";
import { useMapViewport } from "src/hooks/useMapViewport";

export type ActivityMode = "review" | "quiz";

/**
 * This hook helps by providing a way to automatically focus the UI when the activity changes and there are countries to show.
 * @param activityMode Whether to activate the hook or not.
 */
export default function useActivityHelper(activityMode: ActivityMode | undefined, randomize: boolean) {
  const { flyTo, resetView } = useMapViewport();
  const { storedCountry, getNextCountryData, getRandomCountryData, filteredCountryData, resetStore } =
    useCountryStore();

  const focusUI = useCallback(
    (nextCountry: CountryData) => {
      const destination = getCountryCoordinates(nextCountry);
      flyTo(destination);
    },
    [flyTo],
  );

  useEffect(() => {
    if (!activityMode) return;

    if (!storedCountry.data && filteredCountryData.length > 0) {
      const nextCountry = randomize || activityMode === "quiz" ? getRandomCountryData() : getNextCountryData();
      if (nextCountry) focusUI(nextCountry);
    }

    if (storedCountry.data && !filteredCountryData.includes(storedCountry.data)) {
      resetStore();
      resetView();
    }
  }, [
    activityMode,
    storedCountry,
    filteredCountryData,
    getRandomCountryData,
    getNextCountryData,
    focusUI,
    resetStore,
    resetView,
    randomize,
  ]);
}
