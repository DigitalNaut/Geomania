import { useMemo } from "react";
import { useCountryFiltersContext } from "src/contexts/CountryFiltersContext";

import { useMapActivityContext } from "src/contexts/MapActivityContext";
import { useCountryStore } from "src/hooks/useCountryStore";
import { useVisitedCountries } from "src/hooks/useVisitedCountries";

const visitedStyle = "fill-lime-600 stroke-lime-200";
const highlightStyle = "fill-yellow-500 stroke-yellow-200";

export function useReview() {
  const { isCountryInFilters } = useCountryFiltersContext();
  const { setCountryDataNext, setCountryDataRandom, setCountryDataByCode, storedCountry } = useCountryStore();
  const { visitedCountries, pushVisitedCountry, setVisitedCountry, resetVisitedCountries } = useVisitedCountries();
  const { isRandomReviewMode } = useMapActivityContext();

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

    const filteredVisitedCountries = visitedCountries.filter((country) => isCountryInFilters(country.a3));

    return [...filteredVisitedCountries, { a3: storedCountry.data.GU_A3, style: highlightStyle, highlight: true }];
  }, [isCountryInFilters, storedCountry.data, visitedCountries]);

  return {
    clickCountry,
    nextCountry,
    visitedCountries: visitedCountriesWithHighlight,
    resetVisitedCountries,
  };
}
