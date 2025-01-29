import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo } from "react";

import { mapDefaults } from "src/components/map/LeafletMapFrame/defaults";
import { useMapActivityContext } from "src/context/MapActivity/hook";
import { useQuizClick } from "src/controllers/useQuizClick";
import { useQuizInput } from "src/controllers/useQuizInput";
import { useReview } from "src/controllers/useReview";
import { useMapViewport } from "src/hooks/useMapViewport";
import { countryCatalog } from "src/store/CountryStore/slice";
import type { CountryData } from "src/store/CountryStore/types";
import { useAppSelector } from "src/store/hooks";
import { getCountryCoordinates } from "src/utils/features";
import { ActivityCoordinatorContext } from "./hook";

/**
 * Manages the activity flow between reviews and quizzes.
 */
export function ActivityCoordinatorProvider({ children }: PropsWithChildren) {
  const { flyTo, resetViewport } = useMapViewport();
  const { activity } = useMapActivityContext();
  const activityState = useAppSelector((state) => state.countryStore);

  const clickQuiz = useQuizClick();
  const inputQuiz = useQuizInput();
  const review = useReview();

  // const isCountryInFilters = useCallback(
  //   (a3: string) => {
  //     if (!activity) return false;

  //     const state = activityState[activity?.activity];
  //     return state?.blacklistedCountries?.includes(a3) || state?.visitedCountries?.includes(a3);
  //   },
  //   [activity, activityState],
  // );

  const visitedCountries = useMemo<string[]>(() => {
    if (!activity) return [];

    return activityState[activity?.activity]?.visitedCountries || [];
  }, [activity, activityState]);

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

  const currentActivityState = useMemo(
    () => (activity?.activity ? activityState[activity.activity] : null),
    [activity, activityState],
  );

  /**
   * Focuses the UI on the next country by panning the map to the country coordinates
   */
  const focusViewport = useCallback(
    (country: CountryData | null, delay = 0, shouldFly = true) => {
      if (!country) return;

      const destination = getCountryCoordinates(country);
      const zoom = Math.max(country.MIN_LABEL, mapDefaults.minZoom);

      if (shouldFly) flyTo(destination, { zoom }, delay);
    },
    [flyTo],
  );

  const handleMapClick = (a3?: string) => {
    if (!activity || !a3) return;
    if (countryCatalog[a3]?.CONTINENT !== currentActivityState?.currentContinent) return;

    if (activity.activity === "review") {
      focusViewport(review.clickCountry(a3), 100, false);
      return;
    }

    switch (activity.kind) {
      case "typing": {
        focusViewport(currentActivityState?.currentCountry);
        return;
      }

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
    if (!activity) return null;

    if (activity.activity === "review") {
      const nextCountry = review.nextCountry();
      focusViewport(nextCountry);
      return nextCountry;
    }

    switch (activity.kind) {
      case "typing": {
        const nextCountry = inputQuiz.nextCountry();
        focusViewport(nextCountry);
        return nextCountry;
      }

      case "pointing": {
        const nextCountry = clickQuiz.nextCountry();
        focusViewport(nextCountry);
        return nextCountry;
      }
      default:
        return null;
    }
  };

  const setCurrentCountry = (countryA3: string) => {
    if (!activity || activity.activity !== "review") return;

    const country = review.setCurrentCountry(countryA3);
    focusViewport(country);
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
        focusViewport(review.start());
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

      default:
        throw new Error(`Unknown activity: ${activity}`);
    }
  }, [activity, clickQuiz, focusViewport, inputQuiz, review]);

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
    function resetViewportWhenNoActivity() {
      if (activity || currentActivityState?.queue.length) return;

      resetViewport({ animate: false });
    },
    [activity, currentActivityState, resetViewport],
  );

  return (
    <ActivityCoordinatorContext
      value={{
        inputRef: inputQuiz.inputRef,
        giveHint,
        handleMapClick,
        visitedCountries,
        resetActivity: review.resetActivity,
        currentActivityState,
        guessTally,
        nextCountry,
        setCurrentCountry,
        submitAnswer,
        start,
        finish,
      }}
    >
      {children}
    </ActivityCoordinatorContext>
  );
}
