import { useMemo } from "react";
import { useCountryFilters } from "src/hooks/useCountryFilters";

import { useMapActivity } from "src/hooks/useMapActivity";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useVisitedCountries } from "src/hooks/useVisitedCountries";

const visitedStyle = "fill-lime-700 stroke-lime-200";
const highlightStyle = "fill-lime-500 stroke-lime-200";

export function useReview() {
  const { isCountryInData } = useCountryFilters();
  const { setCountryDataNext, setCountryDataRandom, setCountryDataByCode, storedCountry } = useCountryStore();
  const { visitedCountries, pushVisitedCountry, setVisitedCountry, resetVisitedCountries } = useVisitedCountries();
  const { isRandomReviewMode } = useMapActivity();

  function pushStoredCountry() {
    if (!storedCountry.data) return;
    pushVisitedCountry(storedCountry.data.GU_A3, visitedStyle);
  }

  const clickCountry = (a3: string) => {
    pushStoredCountry();
    setVisitedCountry(a3);
    return setCountryDataByCode(a3);
  };

  const nextCountry = () => {
    pushStoredCountry();
    const next = isRandomReviewMode ? setCountryDataRandom() : setCountryDataNext();
    if (next) setVisitedCountry(next?.GU_A3);
    return next;
  };

  const visitedCountriesWithHighlight = useMemo(() => {
    if (!storedCountry.data) return visitedCountries;

    const filteredVisitedCountries = visitedCountries.filter((country) => isCountryInData(country.a3));

    return [...filteredVisitedCountries, { a3: storedCountry.data.GU_A3, style: highlightStyle, highlight: true }];
  }, [isCountryInData, storedCountry.data, visitedCountries]);

  return {
    clickCountry,
    nextCountry,
    visitedCountries: visitedCountriesWithHighlight,
    resetVisitedCountries,
  };
}
