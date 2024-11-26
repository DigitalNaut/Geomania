import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Provider } from ".";
import type { ActivityType } from "./types";
import { ActivityTypeSchema } from "./types";

function validateActivity(activity: unknown): activity is ActivityType {
  return ActivityTypeSchema.safeParse(activity).success;
}

export function MapActivityProvider({ children }: PropsWithChildren) {
  const [searchParams, setURLSearchParams] = useSearchParams();

  const [activity, setActivity] = useState(() => {
    const newActivity = {
      activity: searchParams.get("activity"),
      kind: searchParams.get("kind"),
    };
    if (validateActivity(newActivity)) return newActivity;
    return undefined;
  });
  const [isRandomReviewMode, setRandomReviewMode] = useState(() => searchParams.get("random") === "true");

  const parseSearchParams = useCallback(() => {
    const activity = searchParams.get("activity");
    const kind = searchParams.get("kind");
    const newActivity = { activity, kind };

    const isValid = validateActivity(newActivity);
    const isDifferent = !Object.is(newActivity, activity);
    if (isValid && isDifferent) setActivity(newActivity);
    else setActivity(undefined);
  }, [searchParams]);

  useEffect(() => {
    parseSearchParams();
  }, [parseSearchParams]);

  const toggleRandomReviewMode = (value: boolean) => {
    setRandomReviewMode(value);

    // Lift state to URL
    searchParams.set("random", String(value));
    setURLSearchParams(searchParams);
  };

  return (
    <Provider
      value={{
        isRandomReviewMode,
        toggleRandomReviewMode,
        activity,
      }}
    >
      {children}
    </Provider>
  );
}
