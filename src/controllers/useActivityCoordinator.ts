import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { mapDefaults } from "src/components/map/LeafletMapFrame";
import { type NullableCountryData, getCountryCoordinates, useCountryStore } from "src/hooks/useCountryStore";
import { type VisitedCountry } from "src/components/map/MapSvg";
import { useCountryFiltersContext } from "src/contexts/CountryFiltersContext";
import { useMapActivityContext } from "src/contexts/MapActivityContext";
import { useMapViewport } from "src/hooks/useMapViewport";
import { useQuizClick } from "src/controllers/useQuizClick";
import { useQuizInput } from "src/controllers/useQuizInput";
import { useReview } from "src/controllers/useReview";

/**
 * This hook helps by providing a way to automatically focus the UI when the activity changes and there are countries to show.
 * @param activityMode Whether to activate the hook or not.
 */
export default function useActivityCoordinator() {
  const { flyTo, resetView } = useMapViewport();
  const [searchParams, setURLSearchParams] = useSearchParams();
  const { activity } = useMapActivityContext();
  const { storedCountry, setCountryDataByCode, resetStore } = useCountryStore();
  const { filteredCountryData, isCountryInData } = useCountryFiltersContext();

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
   * Focuses the UI on the next country by
   * 1. Getting the next country data
   * 2. Setting the URL search params
   * 3. Flying to the country
   */
  const focusUI = useCallback(
    (nextCountry: NullableCountryData, delay = 0, fly = true) => {
      if (!nextCountry) return;

      const destination = getCountryCoordinates(nextCountry);
      setURLSearchParams((prev) => {
        if (activity?.activity === "review") prev.set("country", nextCountry.GU_A3);
        else prev.delete("country");
        return prev;
      });

      if (fly)
        flyTo(
          destination,
          {
            zoom: Math.max(nextCountry.MIN_LABEL, mapDefaults.minZoom),
          },
          delay,
        );
    },
    [activity?.activity, flyTo, setURLSearchParams],
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

      let countryData: NullableCountryData = null;

      switch (activity.activity) {
        case "review":
          if (countryParam) countryData = setCountryDataByCode(countryParam);
          else countryData = nextReviewCountry();
          break;

        case "quiz":
          switch (activity.kind) {
            case "pointing":
              countryData = nextClickCountry();
              break;

            case "typing":
              countryData = nextInputCountry();
              break;
          }
      }

      if (countryData && activity.activity === "quiz" && activity.kind !== "pointing") focusUI(countryData);
      else resetUI();
    } else {
      if (filteredCountryData.length === 0 || !filteredCountryData.includes(storedCountry.data)) {
        resetStore();
        resetUI();
      } else if (countryParam && countryParam !== storedCountry.data.GU_A3) {
        const countryData = setCountryDataByCode(countryParam);
        if (countryData && activity.activity === "quiz" && activity.kind !== "pointing") focusUI(countryData);
      }
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
      focusUI(nextReviewCountry());
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
