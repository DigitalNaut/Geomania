import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Provider } from ".";
import type { ActivityType } from "./types";
import { ActivityTypeSchema } from "./types";

// function validateReviewKind(kind: string | null): kind is ReviewKind {
//   return kind !== null && ReviewKindSchema.safeParse(kind).success;
// }

// function validateQuizKind(kind: string | null): kind is QuizKind {
//   return kind !== null && QuizKindSchema.safeParse(kind).success;
// }

function validateActivity(activity: unknown): activity is ActivityType | undefined {
  return ActivityTypeSchema.safeParse(activity).success;
}

// function validateActivity(mode: string | null, kind: string | null): ActivityType | undefined {
//   if (!ActivityModeSchema.safeParse(mode).success) return undefined;

//   if (mode === "review" && validateReviewKind(kind)) return { activity: "review", kind };
//   else if (mode === "quiz" && validateQuizKind(kind)) return { activity: "quiz", kind };

//   return undefined;
// }

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
