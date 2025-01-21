import { useNavigate, useParams, useSearchParams } from "react-router";

import type { ActivityType } from "src/types/map-activity";
import { ActivityTypeSchema } from "src/types/map-activity";

function modifySearchParams(searchParams: URLSearchParams, items: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(items)) {
    if (value === "true") {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  }

  return searchParams;
}

function isValidActivity(activity: unknown): activity is ActivityType {
  return ActivityTypeSchema.safeParse(activity).success;
}

export function useMapActivity() {
  const { activity: activityParam, kind: kindParam } = useParams<Record<string, string | undefined>>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const setActivity = (activity: ActivityType | undefined) => {
    navigate(activity ? `/${activity.activity}/${activity.kind}` : "/");
  };

  const setRandomReviewMode = (isRandomReviewMode: boolean) => {
    if (activityParam !== "review") return;

    setSearchParams(modifySearchParams(searchParams, { random: String(isRandomReviewMode) }), {
      replace: true,
    });
  };

  const isRandomReviewMode = searchParams.get("random") === "true";

  const activity = {
    activity: activityParam,
    kind: kindParam,
  };

  return {
    activity: isValidActivity(activity) ? activity : undefined,
    setActivity,
    isRandomReviewMode,
    setRandomReviewMode,
  };
}
