import type { LatLngTuple } from "leaflet";
import { useState } from "react";

import type { CountryData, useCountryStore } from "src/hooks/useCountryStore";
import type { useMapControl } from "src/hooks/useMapControl";

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
    const destination = !nextCountry
      ? storedCountry.coordinates
      : ([nextCountry.latitude, nextCountry.longitude] as LatLngTuple);

    mapControl.flyTo(destination);
  }

  function showNextCountry() {
    try {
      focusUI(
        isRandomReviewMode ? getRandomCountryData() : getNextCountryData()
      );
    } catch (error) {
      if (error instanceof Error) setError(error);
      else setError(new Error("An unknown error occurred."));
    }
  }

  const handleMapClick = (alpha3?: string) => {
    if (alpha3) focusUI(getCountryDataByCode(alpha3));
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
