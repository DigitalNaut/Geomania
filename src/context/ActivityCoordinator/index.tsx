import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo } from "react";

import { mapDefaults } from "src/components/map/LeafletMapFrame/defaults";
import { useActivityTracker, useMapActivityContext } from "src/context/MapActivity/hook";
import { useQuizClick } from "src/controllers/useQuizClick";
import { useQuizInput } from "src/controllers/useQuizInput";
import { useReview } from "src/controllers/useReview";
import { useMapViewport } from "src/hooks/useMapViewport";
import {
  continentBoundsCatalog,
  countriesByContinent,
  countryCatalog,
  selectCurrentContinent,
  selectCurrentCountryData,
} from "src/store/CountryStore/slice";
import type { CountryData } from "src/store/CountryStore/types";
import { useAppSelector } from "src/store/hooks";
import type { ActivityType } from "src/types/map-activity";
import { getLabelCoordinates } from "src/utils/features";
import { ActivityCoordinatorContext } from "./hook";
import type { StrategyFactory } from "./types";

type ActivityKindStrategy<R = void> = StrategyFactory<ActivityType, "kind", () => R>;

/**
 * Manages the activity flow between reviews and quizzes.
 */
export function ActivityCoordinatorProvider({ children }: PropsWithChildren) {
  const { flyTo, fitTo, resetViewport } = useMapViewport();
  const { activity } = useMapActivityContext();
  const countryStore = useAppSelector((state) => state.countryStore);

  const clickQuiz = useQuizClick();
  const inputQuiz = useQuizInput();
  const review = useReview();

  const currentActivityState = useMemo(
    () => (activity?.activity ? countryStore[activity.activity] : null),
    [activity, countryStore],
  );

  const visitedCountries = useMemo<string[]>(() => {
    if (!currentActivityState) return [];

    return currentActivityState.visitedCountries;
  }, [currentActivityState]);

  const currentContinentSelector = useMemo(() => selectCurrentContinent(activity?.activity), [activity?.activity]);
  const currentContinent = useAppSelector(currentContinentSelector);

  const currentCountryDataSelector = useMemo(() => selectCurrentCountryData(activity?.activity), [activity?.activity]);
  const currentCountryData = useAppSelector(currentCountryDataSelector);

  const unvisitedCountries = useMemo<string[]>(() => {
    if (!currentActivityState) return [];
    if (!currentContinent) return [];

    const all = new Set(countriesByContinent[currentContinent]);
    const visited = new Set(currentActivityState.visitedCountries);
    const unvisited = all.difference(visited).values();

    return Array.from(unvisited);
  }, [currentActivityState, currentContinent]);

  const guessTally = useMemo(() => {
    if (!activity) return 0;

    const strategies: ActivityKindStrategy<number> = {
      pointing: () => clickQuiz.userGuessTally,
      typing: () => inputQuiz.userGuessTally,
      countries: () => 0,
    };

    return strategies[activity.kind]();
  }, [activity, clickQuiz, inputQuiz]);

  /**
   * Focuses the UI on the next country by panning the map to the country coordinates
   */
  const focusViewportCountry = useCallback(
    (country: CountryData | null, delay = 0, shouldFly = true) => {
      if (!country) return;

      const destination = getLabelCoordinates(country);
      const zoom = Math.max((country.MIN_LABEL + country.MAX_LABEL) / 2 - 2, mapDefaults.minZoom);

      if (shouldFly) flyTo(destination, { zoom }, delay);
    },
    [flyTo],
  );

  /**
   *
   * @param a3
   * @returns
   */
  const focusViewportContinent = useCallback(
    (continent?: string | null) => {
      if (!continent || continent.length === 0) return;

      const bounds = continentBoundsCatalog[continent];

      fitTo(bounds);
    },
    [fitTo],
  );

  const handleMapClick = (a3?: string) => {
    if (!activity || !a3) return;
    if (countryCatalog[a3]?.CONTINENT !== currentContinent) return;

    const strategies: ActivityKindStrategy = {
      countries: () => focusViewportCountry(review.setCurrentCountry(a3), 100, false),
      typing: () => focusViewportCountry(currentCountryData),
      pointing: () => focusViewportContinent(clickQuiz.submitClick(a3)?.CONTINENT),
    };

    strategies[activity.kind]();
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

    const strategies: ActivityKindStrategy<CountryData | null> = {
      countries: () => review.nextCountry(),
      typing: () => inputQuiz.nextCountry(),
      pointing: () => clickQuiz.nextCountry(),
    };

    const nextCountry = strategies[activity.kind]();
    focusViewportContinent(nextCountry?.CONTINENT);

    return nextCountry;
  };

  const setCurrentCountry = (countryA3: string) => {
    if (!activity) return;

    const strategies: ActivityKindStrategy<CountryData | null> = {
      countries: () => review.setCurrentCountry(countryA3),
      typing: () => null,
      pointing: () => null,
    };

    const country = strategies[activity.kind]();
    focusViewportCountry(country);
  };

  const submitAnswer = () => {
    if (!activity) return null;

    const strategies: ActivityKindStrategy<CountryData | null> = {
      countries: () => null,
      typing: () => inputQuiz.submitInput(),
      pointing: () => null,
    };

    const nextCountry = strategies[activity.kind]();
    focusViewportContinent(nextCountry?.CONTINENT);

    return nextCountry;
  };

  const start = useCallback(() => {
    if (!activity) return;

    const strategies: ActivityKindStrategy<CountryData | null> = {
      countries: () => review.start(),
      typing: () => inputQuiz.start(),
      pointing: () => clickQuiz.start(),
    };

    const nextCountry = strategies[activity.kind]();
    focusViewportCountry(nextCountry, 100);
  }, [activity, clickQuiz, focusViewportCountry, inputQuiz, review]);

  const finish = useCallback(() => {
    if (!activity) return;

    const strategies: ActivityKindStrategy = {
      countries: () => review.finish(),
      typing: () => inputQuiz.finish(),
      pointing: () => clickQuiz.finish(),
    };

    strategies[activity.kind]();
  }, [activity, clickQuiz, inputQuiz, review]);

  const reset = useCallback(() => {
    if (!activity) return;

    const strategies: ActivityKindStrategy = {
      countries: () => review.reset(),
      typing: () => inputQuiz.reset(),
      pointing: () => clickQuiz.reset(),
    };

    strategies[activity.kind]();
  }, [activity, clickQuiz, inputQuiz, review]);

  useActivityTracker(() => {
    focusViewportContinent(currentContinent);
  });

  useEffect(
    function resetViewportWhenNoActivity() {
      if (activity || currentActivityState?.queue.length) return;

      resetViewport();
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
        unvisitedCountries,
        reset,
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
