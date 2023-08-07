import { useCallback, useEffect } from "react";
import { type CountryData, getCountryCoordinates, useCountryStore } from "src/hooks/useCountryStore";
import { useMapViewport } from "src/hooks/useMapViewport";

/**
 * This hook helps by providing a way to automatically focus the UI when the activity changes and there are countries to show.
 * @param active Whether to activate the hook or not.
 */
export default function useActivityHelper(active: boolean, random: boolean) {
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
    if (!active) return;

    if (!storedCountry.data && filteredCountryData.length > 0) {
      const nextCountry = random ? getRandomCountryData() : getNextCountryData();
      if (nextCountry) focusUI(nextCountry);
    }

    if (storedCountry.data && !filteredCountryData.includes(storedCountry.data)) {
      resetStore();
      resetView();
    }
  }, [
    active,
    storedCountry,
    filteredCountryData,
    getRandomCountryData,
    getNextCountryData,
    focusUI,
    resetStore,
    resetView,
    random,
  ]);
}
