import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Provider } from ".";
import type { ActivityType } from "./types";
import { ActivityTypeSchema } from "./types";

function validateActivity(activity: unknown): activity is ActivityType {
  return ActivityTypeSchema.safeParse(activity).success;
}

export function MapActivityProvider({ children }: PropsWithChildren) {
  const [searchParams, setURLSearchParams] = useSearchParams();

  const [isRandomReviewMode, setRandomReviewMode] = useState(() => searchParams.get("random") === "true");

  const activity = useMemo(() => {
    const activity = searchParams.get("activity");
    const kind = searchParams.get("kind");
    const newActivity = { activity, kind };

    const isValid = validateActivity(newActivity);
    if (isValid) return newActivity;

    return undefined;
  }, [searchParams]);

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
