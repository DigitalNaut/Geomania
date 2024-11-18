import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { mapDefaults } from "src/components/map/LeafletMapFrame/defaults";
import type { VisitedCountry } from "src/components/map/MapSvg";
import { useMapActivity } from "src/hooks/useMapActivity";
import { useQuizClick } from "src/controllers/useQuizClick";
import { useQuizInput } from "src/controllers/useQuizInput";
import { useReview } from "src/controllers/useReview";
import { useCountryFilters } from "src/hooks/useCountryFilters";
import { useCountryStore } from "src/hooks/useCountryStore";
import type { NullableCountryData } from "src/types/features";
import { useMapViewport } from "src/hooks/useMapViewport";
import { getCountryCoordinates } from "src/utils/features";

/**
 * This hook helps by providing a way to automatically focus the UI when the activity changes and there are countries to show.
 * @param activityMode Whether to activate the hook or not.
 */
export default function useActivityCoordinator() {
  const { flyTo, resetView } = useMapViewport();
  const [searchParams, setURLSearchParams] = useSearchParams();
  const { activity } = useMapActivity();
  const { storedCountry, setCountryDataByCode, resetStore } = useCountryStore();
  const { filteredCountryData, isCountryInData } = useCountryFilters();

  const {
    submitClick,
    userGuessTally: clickGuessTally,
    giveHint: giveClickHint,
    nextCountry: nextClickCountry,
    visitedCountries: visitedClick,
  } = useQuizClick();
  const {
    inputRef,
    submitInput,
    userGuessTally: inputGuessTally,
    giveHint: giveInputHint,
    nextCountry: nextInputCountry,
    visitedCountries: visitedInput,
  } = useQuizInput();
  const {
    nextCountry: nextReviewCountry,
    clickCountry: clickReview,
    visitedCountries: visitedReview,
    resetVisitedCountries: resetVisited,
  } = useReview();

  const visitedCountries = useMemo<VisitedCountry[]>(() => {
    switch (activity?.activity) {
      case "quiz":
        switch (activity.kind) {
          case "pointing":
            return visitedClick;

          case "typing":
            return visitedInput;

          default:
            return [];
        }

      case "review":
        return visitedReview;

      default:
        return [];
    }
  }, [activity, visitedClick, visitedInput, visitedReview]);

  const guessTally = useMemo(() => {
    if (activity?.activity === "quiz")
      switch (activity.kind) {
        case "pointing":
          return clickGuessTally;

        case "typing":
          return inputGuessTally;
      }

    return 0;
  }, [activity, clickGuessTally, inputGuessTally]);

  /**
   * Lifts the country state to the URL search params by its A3
   */
  const liftCountryA3 = useCallback(
    (a3: string) => {
      setURLSearchParams((prev) => {
        if (activity?.activity === "review") prev.set("country", a3);
        else prev.delete("country");

        return prev;
      });
    },
    [activity, setURLSearchParams],
  );

  /**
   * Focuses the UI on the next country by panning the map to the country coordinates
   */
  const focusUI = useCallback(
    (country: NullableCountryData, delay = 0, shouldFly = true) => {
      if (!country) return;

      const destination = getCountryCoordinates(country);
      const zoom = Math.max(country.MIN_LABEL, mapDefaults.minZoom);

      if (shouldFly) flyTo(destination, { zoom }, delay);
    },
    [flyTo],
  );

  const resetUI = useCallback(() => {
    setURLSearchParams((prev) => {
      prev.delete("country");
      return prev;
    });
  }, [setURLSearchParams]);

  useEffect(() => {
    if (!activity) return;

    const countryParam = searchParams.get("country");

    if (!storedCountry.data) {
      if (filteredCountryData.length === 0) {
        resetView();
        return;
      }

      switch (activity.activity) {
        case "review":
          if (countryParam) setCountryDataByCode(countryParam);
          else nextReviewCountry();
          break;

        case "quiz":
          switch (activity.kind) {
            case "pointing":
              nextClickCountry();
              break;

            case "typing": {
              const countryData = nextInputCountry();
              if (countryData) focusUI(countryData);
              break;
            }
          }
      }

      return;
    }

    if (filteredCountryData.length === 0 || !filteredCountryData.includes(storedCountry.data)) {
      resetStore();
      resetUI();
      return;
    }

    if (countryParam && countryParam !== storedCountry.data.GU_A3) {
      const countryData = setCountryDataByCode(countryParam);
      if (countryData && activity.activity === "quiz" && activity.kind === "typing") focusUI(countryData);
    }
  }, [
    activity,
    filteredCountryData,
    focusUI,
    resetStore,
    resetUI,
    resetView,
    searchParams,
    setCountryDataByCode,
    nextClickCountry,
    nextInputCountry,
    nextReviewCountry,
    storedCountry.data,
  ]);

  const handleMapClick = (a3?: string) => {
    if (!activity || !a3) return;
    if (!isCountryInData(a3)) return;

    if (activity.activity === "review") {
      focusUI(clickReview(a3), 100, false);
      liftCountryA3(a3);
      return;
    }

    switch (activity.kind) {
      case "typing":
        focusUI(storedCountry.data);
        return;

      case "pointing": {
        focusUI(submitClick(a3), 250);
        return;
      }
    }
  };

  const giveHint = () => {
    if (!activity || activity.activity === "review") return;

    switch (activity.kind) {
      case "typing":
        giveInputHint();
        break;

      case "pointing":
        giveClickHint();
        break;
    }
  };

  const nextCountry = () => {
    if (!activity) return;

    if (activity.activity === "review") {
      const nextCountry = nextReviewCountry();

      focusUI(nextCountry);
      if (!nextCountry) return;

      liftCountryA3(nextCountry.GU_A3);
      return;
    }

    switch (activity.kind) {
      case "typing": {
        focusUI(nextInputCountry());
        break;
      }

      case "pointing": {
        focusUI(nextClickCountry());
        break;
      }
    }
  };

  const submitAnswer = () => {
    if (!activity || activity.activity === "review" || activity.kind === "pointing") return null;

    const nextCountry = submitInput();
    focusUI(nextCountry, 100);

    return nextCountry;
  };

  return {
    inputRef,
    giveHint,
    handleMapClick,
    visitedCountries,
    resetVisited,
    guessTally,
    nextCountry,
    submitAnswer,
  };
}
