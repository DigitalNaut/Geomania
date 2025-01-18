import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import type { VisitedCountry } from "src/components/map/MapSvg";
import { useCountryStore } from "src/context/CountryStore";
import { useFilteredCountriesContext } from "src/context/FilteredCountryData";
import { useMapActivity } from "src/hooks/useMapActivity";
import { useVisitedCountries } from "src/hooks/useVisitedCountries";
import type { NullableCountryData } from "src/types/features";
import type { IActivity } from "./types";

const visitedStyle = "fill-lime-700 stroke-lime-200";
const highlightStyle = "fill-lime-500 stroke-lime-200";

export function useReview(): IActivity & {
  clickCountry: (a3: string) => NullableCountryData;
  visitedCountries: VisitedCountry[];
  resetVisitedCountries: () => void;
} {
  const [searchParams, setURLSearchParams] = useSearchParams();
  const { isCountryInFilters } = useFilteredCountriesContext();
  const { setCountryDataNext, setCountryDataRandom, setCountryDataByCode, storedCountry } = useCountryStore();
  const { visitedCountries, pushVisitedCountry, setVisitedCountry, resetVisitedCountries } = useVisitedCountries();
  const { isRandomReviewMode } = useMapActivity();

  const pushStoredCountry = useCallback(() => {
    if (!storedCountry.data) return;
    pushVisitedCountry(storedCountry.data.GU_A3, visitedStyle);
  }, [pushVisitedCountry, storedCountry.data]);

  const liftCountryToParams = useCallback(
    (a3: string) => {
      setURLSearchParams((prev) => {
        prev.set("country", a3);
        return prev;
      });
    },
    [setURLSearchParams],
  );

  const clickCountry = useCallback(
    (a3: string) => {
      pushStoredCountry();
      liftCountryToParams(a3);
      setVisitedCountry(a3);
      return setCountryDataByCode(a3);
    },
    [liftCountryToParams, pushStoredCountry, setCountryDataByCode, setVisitedCountry],
  );

  const nextCountry = useCallback(() => {
    pushStoredCountry();
    const next = isRandomReviewMode ? setCountryDataRandom() : setCountryDataNext();
    if (next) {
      liftCountryToParams(next.GU_A3);
      setVisitedCountry(next?.GU_A3);
    }
    return next;
  }, [
    isRandomReviewMode,
    liftCountryToParams,
    pushStoredCountry,
    setCountryDataNext,
    setCountryDataRandom,
    setVisitedCountry,
  ]);

  const visitedCountriesWithHighlight = useMemo(() => {
    if (!storedCountry.data) return visitedCountries;

    const filteredVisitedCountries = visitedCountries.filter((country) => isCountryInFilters(country.a3));

    return [...filteredVisitedCountries, { a3: storedCountry.data.GU_A3, style: highlightStyle, highlight: true }];
  }, [isCountryInFilters, storedCountry.data, visitedCountries]);

  const clearCountryFromParams = useCallback(() => {
    setURLSearchParams((prev) => {
      prev.delete("country");
      return prev;
    });
  }, [setURLSearchParams]);

  const getCountryFromParams = useCallback(() => searchParams.get("country"), [searchParams]);

  const start = useCallback(() => {
    if (storedCountry.data) return;

    const a3 = getCountryFromParams();
    if (!a3) {
      nextCountry();
      return;
    }
    if (a3.length === 0) {
      clearCountryFromParams();
      return;
    }

    if (isCountryInFilters(a3)) clickCountry(a3);
  }, [clearCountryFromParams, clickCountry, getCountryFromParams, isCountryInFilters, nextCountry, storedCountry]);

  const finish = useCallback(() => {
    clearCountryFromParams();
  }, [clearCountryFromParams]);

  return {
    clickCountry,
    nextCountry,
    visitedCountries: visitedCountriesWithHighlight,
    resetVisitedCountries,
    start,
    finish,
  };
}
