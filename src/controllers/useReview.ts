import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import {
  addVisitedCountry,
  countryCatalog,
  getNextCountry,
  setCurrentCountryByCode,
  clearVisitedCountries,
  clearQueue,
} from "src/store/CountryStore/slice";
import type { CountryData } from "src/store/CountryStore/types";
import { useAppDispatch, useAppSelector } from "src/store/hooks";
import type { IActivity } from "./types";

const activityType = "review";

export function useReview(): IActivity & {
  clickCountry: (a3: string) => CountryData | null;
  setCurrentCountry: (a3: string) => CountryData | null;
  visitedCountries: string[];
  resetActivity: () => void;
} {
  const [searchParams, setURLSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const activityState = useAppSelector((state) => state.countryStore);
  const currentActivity = activityState[activityType];

  const liftCountryToParams = useCallback(
    (a3: string) => {
      setURLSearchParams((prev) => {
        prev.set("country", a3);
        return prev;
      });
    },
    [setURLSearchParams],
  );

  const selectCountry = useCallback(
    (countryA3: string) => {
      dispatch(setCurrentCountryByCode({ countryA3, activityType }));
      dispatch(addVisitedCountry({ countryA3, activityType }));

      liftCountryToParams(countryA3);

      return countryCatalog[countryA3];
    },
    [dispatch, liftCountryToParams],
  );

  const isCountryInFilters = useCallback(
    (targetA3: string) => {
      return currentActivity.visitedCountries.includes(targetA3);
    },
    [currentActivity.visitedCountries],
  );

  const nextCountry = useCallback(() => {
    const countryData = dispatch(getNextCountry(activityType));

    if (countryData) {
      liftCountryToParams(countryData.GU_A3);
      dispatch(addVisitedCountry({ countryA3: countryData.GU_A3, activityType }));
    }

    return countryData;
  }, [dispatch, liftCountryToParams]);

  const setCurrentCountry = useCallback(
    (countryA3: string) => {
      {
        dispatch(setCurrentCountryByCode({ countryA3, activityType }));
        return countryCatalog[countryA3];
      }
    },
    [dispatch],
  );

  const visitedCountries = useMemo(() => {
    if (!currentActivity.currentCountry) return [];

    const filteredVisitedCountries = currentActivity.visitedCountries.filter((country) => isCountryInFilters(country));

    return [...filteredVisitedCountries, currentActivity.currentCountry.GU_A3];
  }, [currentActivity.currentCountry, currentActivity.visitedCountries, isCountryInFilters]);

  const clearCountryFromParams = useCallback(() => {
    setURLSearchParams((prev) => {
      prev.delete("country");
      return prev;
    });
  }, [setURLSearchParams]);

  const getCountryFromParams = useCallback(() => searchParams.get("country"), [searchParams]);

  const resetActivity = useCallback(() => {
    dispatch(setCurrentCountryByCode({ countryA3: "", activityType }));
    dispatch(clearVisitedCountries({ activityType }));
    dispatch(clearQueue({ activityType }));
    clearCountryFromParams();
  }, [clearCountryFromParams, dispatch]);

  const start = useCallback(() => {
    if (currentActivity.currentCountry) return selectCountry(currentActivity.currentCountry.GU_A3);

    const a3 = getCountryFromParams();
    if (!a3) {
      return nextCountry();
    }
    if (a3.length === 0) {
      clearCountryFromParams();
      return nextCountry();
    }

    if (isCountryInFilters(a3)) return nextCountry();

    return selectCountry(a3);
  }, [
    clearCountryFromParams,
    selectCountry,
    currentActivity.currentCountry,
    getCountryFromParams,
    isCountryInFilters,
    nextCountry,
  ]);

  const finish = useCallback(() => {
    clearCountryFromParams();
  }, [clearCountryFromParams]);

  return {
    nextCountry,
    setCurrentCountry,
    start,
    finish,
    visitedCountries,
    clickCountry: selectCountry,
    resetActivity,
  };
}
