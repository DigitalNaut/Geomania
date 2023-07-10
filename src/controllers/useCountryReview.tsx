import { useState } from "react";

import type { CountryData, useCountryStore } from "src/hooks/useCountryStore";
import type { useMapControl } from "src/hooks/useMapControl";
import { getCountryCoordinates } from "src/hooks/useCountryStore";

export function useCountryReview(
  countryStore: ReturnType<typeof useCountryStore>,
  mapControl: ReturnType<typeof useMapControl>,
  setError: (error: Error) => void
) {
  const [isRandomReviewMode, setRandomReviewMode] = useState(false);

  const {
    storedCountry,
    getRandomCountryData,
    getNextCountryData,
    getCountryDataByCode,
  } = countryStore;

  function focusUI(nextCountry: CountryData) {
    const destination = getCountryCoordinates(nextCountry);
    mapControl.flyTo(destination);
  }

  function showNextCountry() {
    try {
      const nextCountry = isRandomReviewMode
        ? getRandomCountryData()
        : getNextCountryData();
      if (nextCountry) focusUI(nextCountry);
    } catch (error) {
      if (error instanceof Error) setError(error);
      else setError(new Error("An unknown error occurred."));
    }
  }

  const handleMapClick = (alpha3?: string) => {
    const country = getCountryDataByCode(alpha3);
    if (country) focusUI(country);
    else if (storedCountry.data) focusUI(storedCountry.data);
    else showNextCountry();
  };

  return {
    handleMapClick,
    showNextCountry,
    isRandomReviewMode,
    setRandomReviewMode,
  };
}
