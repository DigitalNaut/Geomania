import type { LatLngTuple } from "leaflet";

import type { CountryData } from "src/controllers/MapController";
import type { useCountryStore } from "src/hooks/useCountryStore";
import type { useMapControl } from "src/hooks/useMapControl";

export function useCountryReview(
  countryStore: ReturnType<typeof useCountryStore>,
  mapControl: ReturnType<typeof useMapControl>,
  setError: (error: Error) => void
) {
  const { countryStored, getRandomCountryData } = countryStore;

  function focusUI(nextCountry: CountryData) {
    const destination = !nextCountry
      ? countryStored.coordinates
      : ([nextCountry.latitude, nextCountry.longitude] as LatLngTuple);

    mapControl.flyTo(destination);
  }

  function showNextCountry() {
    try {
      const nextCountry = getRandomCountryData();
      focusUI(nextCountry);
    } catch (error) {
      if (error instanceof Error) setError(error);
      else setError(new Error("An unknown error occurred."));
    }
  }

  const handleMapClick = () => {
    if (countryStored.data) focusUI(countryStored.data);
    else showNextCountry();
  };

  return {
    handleMapClick,
    showNextCountry,
  };
}
