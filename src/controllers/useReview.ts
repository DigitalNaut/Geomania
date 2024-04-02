import { useMemo } from "react";

import { useMapActivityContext } from "src/contexts/MapActivityContext";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useVisitedCountries } from "src/hooks/useVisitedCountries";

const visitedStyle = "fill-yellow-500 stroke-yellow-200";
const highlightStyle = "fill-yellow-400 stroke-yellow-200";

export function useReview() {
  const { setCountryDataNext, setCountryDataRandom, setCountryDataByCode, storedCountry } = useCountryStore();
  const { visitedCountries, pushVisitedCountry, filterVisitedCountry } = useVisitedCountries();
  const { isRandomReviewMode } = useMapActivityContext();

  function pushStoredCountry() {
    if (!storedCountry.data) return;
    pushVisitedCountry(storedCountry.data.GU_A3, visitedStyle);
  }

  const clickCountry = (a3: string) => {
    pushStoredCountry();
    filterVisitedCountry(a3);
    return setCountryDataByCode(a3);
  };

  const nextCountry = () => {
    pushStoredCountry();
    const next = isRandomReviewMode ? setCountryDataRandom() : setCountryDataNext();
    if (next) filterVisitedCountry(next?.GU_A3);
    return next;
  };

  const visitedCountriesHighlight = useMemo(() => {
    if (!storedCountry.data) return visitedCountries;
    return [...visitedCountries, { a3: storedCountry.data.GU_A3, style: highlightStyle, highlight: true }];
  }, [storedCountry.data, visitedCountries]);

  return {
    clickCountry,
    nextCountry,
    visitedCountries: visitedCountriesHighlight,
  };
}
