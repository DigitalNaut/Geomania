import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Provider } from ".";
import type { ActivityType } from "./types";
import { ActivityTypeSchema } from "./types";

function validateActivity(activity: unknown): activity is ActivityType | undefined {
  return ActivityTypeSchema.safeParse(activity).success;
}

export function MapActivityProvider({ children }: PropsWithChildren) {
  const [searchParams, setURLSearchParams] = useSearchParams();
  const activityMode = useMemo(() => searchParams.get("activity"), [searchParams]);
  const activityKind = useMemo(() => searchParams.get("kind"), [searchParams]);
  const activity = useMemo(() => {
    const newActivity = { activity: activityMode, kind: activityKind };
    return validateActivity(newActivity) ? newActivity : undefined;
  }, [activityMode, activityKind]);
  const isRandomReview = useMemo(() => /^true$/i.test(searchParams.get("random") || ""), [searchParams]);
  const [isRandomReviewMode, setRandomReviewMode] = useState(() => isRandomReview);

  const setReviewMode: Dispatch<SetStateAction<boolean>> = (value) => {
    setRandomReviewMode(value);
    if (value) searchParams.set("random", "true");
    else searchParams.delete("random");
    setURLSearchParams(searchParams);
  };

  return (
    <Provider
      value={{
        isRandomReviewMode,
        setRandomReviewMode: setReviewMode,
        activity,
      }}
    >
      {children}
    </Provider>
  );
}
