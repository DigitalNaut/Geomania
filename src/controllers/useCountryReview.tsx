import { useState } from "react";

import { useMapViewport } from "src/hooks/useMapViewport";
import { type CountryData, type useCountryStore, getCountryCoordinates } from "src/hooks/useCountryStore";

export function useCountryReview(countryStore: ReturnType<typeof useCountryStore>, setError: (error: Error) => void) {
  const mapControl = useMapViewport();
  const [isRandomReviewMode, setRandomReviewMode] = useState(false);

  const { storedCountry, getRandomCountryData, getNextCountryData, getCountryDataByCode } = countryStore;

  function focusUI(nextCountry: CountryData) {
    const destination = getCountryCoordinates(nextCountry);
    mapControl.flyTo(destination);
  }

  function showNextCountry() {
    try {
      const nextCountry = isRandomReviewMode ? getRandomCountryData() : getNextCountryData();
      if (nextCountry) focusUI(nextCountry);
    } catch (error) {
      if (error instanceof Error) setError(error);
      else setError(new Error("An unknown error occurred."));
    }
  }

  const handleMapClick = (a3?: string) => {
    try {
      const country = getCountryDataByCode(a3);
      if (country) focusUI(country);
      else if (storedCountry.data) focusUI(storedCountry.data);
      else showNextCountry();
    } catch (error) {
      if (error instanceof Error) setError(error);
      else setError(new Error("An unknown error occurred."));
    }
  };

  return {
    handleMapClick,
    showNextCountry,
    isRandomReviewMode,
    setRandomReviewMode,
  };
}
