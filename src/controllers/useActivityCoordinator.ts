import { useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

import { mapDefaults } from "src/components/map/LeafletMapFrame/defaults";
import type { VisitedCountry } from "src/components/map/MapSvg";
import { useCountryStore } from "src/context/CountryStore";
import { useFilteredCountriesContext } from "src/context/FilteredCountryData";
import { useQuizClick } from "src/controllers/useQuizClick";
import { useQuizInput } from "src/controllers/useQuizInput";
import { useReview } from "src/controllers/useReview";
import { useMapViewport } from "src/hooks/useMapViewport";
import type { RootState } from "src/store";
import type { NullableCountryData } from "src/types/features";
import { getCountryCoordinates } from "src/utils/features";

/**
 * Automatically focuses the UI when the activity changes and there are countries to show.
 * @param activityMode Whether to activate the hook or not.
 */
export default function useActivityManager() {
  const { flyTo, resetViewport } = useMapViewport();
  const { activity } = useSelector((state: RootState) => state.mapActivity);
  const { storedCountry } = useCountryStore();
  const { isCountryInFilters, filteredCountryData } = useFilteredCountriesContext();

  const clickQuiz = useQuizClick();
  const inputQuiz = useQuizInput();
  const review = useReview();

  const visitedCountries = useMemo<VisitedCountry[]>(() => {
    switch (activity?.activity) {
      case "quiz":
        switch (activity.kind) {
          case "pointing":
            return clickQuiz.visitedCountries;

          case "typing":
            return inputQuiz.visitedCountries;

          default:
            return [];
        }

      case "review":
        return review.visitedCountries;

      default:
        return [];
    }
  }, [activity, clickQuiz, inputQuiz, review]);

  const guessTally = useMemo(() => {
    if (activity?.activity === "quiz")
      switch (activity.kind) {
        case "pointing":
          return clickQuiz.userGuessTally;

        case "typing":
          return inputQuiz.userGuessTally;
      }

    return 0;
  }, [activity, clickQuiz, inputQuiz]);

  /**
   * Focuses the UI on the next country by panning the map to the country coordinates
   */
  const focusViewport = useCallback(
    (country: NullableCountryData, delay = 0, shouldFly = true) => {
      if (!country) return;

      const destination = getCountryCoordinates(country);
      const zoom = Math.max(country.MIN_LABEL, mapDefaults.minZoom);

      if (shouldFly) flyTo(destination, { zoom }, delay);
    },
    [flyTo],
  );

  const handleMapClick = (a3?: string) => {
    if (!activity || !a3) return;
    if (!isCountryInFilters(a3)) return;

    if (activity.activity === "review") {
      focusViewport(review.clickCountry(a3), 100, false);
      return;
    }

    switch (activity.kind) {
      case "typing":
        focusViewport(storedCountry.data);
        return;

      case "pointing": {
        focusViewport(clickQuiz.submitClick(a3), 250);
        return;
      }
    }
  };

  const giveHint = () => {
    if (!activity || activity.activity === "review") return;

    switch (activity.kind) {
      case "typing":
        inputQuiz.giveHint();
        break;

      case "pointing":
        clickQuiz.giveHint();
        break;
    }
  };

  const nextCountry = () => {
    if (!activity) return;

    if (activity.activity === "review") {
      const nextCountry = review.nextCountry();

      focusViewport(nextCountry);
      if (!nextCountry) return;

      return;
    }

    switch (activity.kind) {
      case "typing": {
        focusViewport(inputQuiz.nextCountry());
        break;
      }

      case "pointing": {
        focusViewport(clickQuiz.nextCountry());
        break;
      }
    }
  };

  const submitAnswer = () => {
    if (!activity || activity.activity !== "quiz" || activity.kind !== "typing") return null;

    const nextCountry = inputQuiz.submitInput();
    focusViewport(nextCountry, 100);

    return nextCountry;
  };

  const start = useCallback(() => {
    if (!activity) return;

    switch (activity?.activity) {
      case "review":
        review.start();
        break;

      case "quiz":
        switch (activity.kind) {
          case "pointing":
            clickQuiz.start();
            break;

          case "typing":
            inputQuiz.start();
            break;
        }
        break;
    }
  }, [activity, clickQuiz, inputQuiz, review]);

  const finish = useCallback(() => {
    if (!activity) return;

    switch (activity?.activity) {
      case "review":
        review.finish();
        break;

      case "quiz":
        switch (activity.kind) {
          case "pointing":
            clickQuiz.finish();
            break;

          case "typing":
            inputQuiz.finish();
            break;
        }
        break;
    }
  }, [activity, clickQuiz, inputQuiz, review]);

  useEffect(
    function manageViewportOnNoActivity() {
      if (activity || storedCountry.data || filteredCountryData.length > 0) return;

      resetViewport({ animate: false });
    },
    [activity, filteredCountryData.length, resetViewport, storedCountry.data],
  );

  return {
    inputRef: inputQuiz.inputRef,
    giveHint,
    handleMapClick,
    visitedCountries,
    resetVisited: review.resetVisitedCountries,
    guessTally,
    nextCountry,
    submitAnswer,
    start,
    finish,
  };
}
