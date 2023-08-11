import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { type CountryData, getCountryCoordinates, useCountryStore } from "src/hooks/useCountryStore";
import { useMapViewport } from "src/hooks/useMapViewport";

export const ActivityMode = ["review", "quiz"] as const;
export type ActivityMode = (typeof ActivityMode)[number];

/**
 * This hook helps by providing a way to automatically focus the UI when the activity changes and there are countries to show.
 * @param activityMode Whether to activate the hook or not.
 */
export default function useActivityHelper(
  activityMode: ActivityMode | null,
  randomize: boolean,
  setError: (error: Error) => void,
) {
  const { flyTo, resetView } = useMapViewport();
  const [searchParams, setURLSearchParams] = useSearchParams();
  const {
    storedCountry,
    getNextCountryData,
    getRandomCountryData,
    getCountryDataByCode,
    filteredCountryData,
    resetStore,
  } = useCountryStore();

  const focusUI = useCallback(
    (nextCountry?: CountryData) => {
      const countryData = nextCountry ?? storedCountry.data;
      if (!countryData) return;

      const destination = getCountryCoordinates(countryData);
      setURLSearchParams((prev) => {
        if (activityMode === "review") prev.set("country", countryData.a3);
        else prev.delete("country");
        return prev;
      });
      flyTo(destination);
    },
    [activityMode, flyTo, setURLSearchParams, storedCountry.data],
  );

  const resetUI = useCallback(() => {
    setURLSearchParams((prev) => {
      prev.delete("country");
      return prev;
    });
  }, [setURLSearchParams]);

  function showNextCountry() {
    try {
      const nextCountry = randomize ? getRandomCountryData() : getNextCountryData();
      if (nextCountry) focusUI(nextCountry);
    } catch (error) {
      if (error instanceof Error) setError(error);
      else setError(new Error("An unknown error occurred."));
    }
  }

  useEffect(() => {
    if (!activityMode) return;

    const countryParam = searchParams.get("country");

    if (!storedCountry.data) {
      if (filteredCountryData.length === 0) {
        resetView();
        return;
      }

      let countryData: CountryData | null = null;

      if (activityMode === "review") {
        if (countryParam) countryData = getCountryDataByCode(countryParam);
        else countryData = randomize ? getRandomCountryData() : getNextCountryData();
      } else if (activityMode === "quiz") countryData = getRandomCountryData();

      if (countryData) focusUI(countryData);
      else resetUI();
    } else {
      if (filteredCountryData.length === 0 || !filteredCountryData.includes(storedCountry.data)) {
        resetStore();
        resetUI();
      } else if (countryParam && countryParam !== storedCountry.data.a3) {
        const countryData = getCountryDataByCode(countryParam);
        if (countryData) focusUI(countryData);
      }
    }
  }, [
    activityMode,
    storedCountry,
    filteredCountryData,
    randomize,
    searchParams,

    getRandomCountryData,
    getNextCountryData,
    getCountryDataByCode,
    focusUI,
    resetUI,
    resetStore,
    resetView,
    setURLSearchParams,
    setError,
  ]);

  return {
    showNextCountry,
    focusUI,
  };
}
