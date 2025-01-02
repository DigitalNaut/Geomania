import type { ActivityType } from "./types";
import { ActivityTypeSchema } from "./types";

function isValidActivity(activity: unknown): activity is ActivityType {
  return ActivityTypeSchema.safeParse(activity).success;
}

export function deriveActivityFromURL() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const activity = {
    activity: urlSearchParams.get("activity"),
    kind: urlSearchParams.get("kind"),
  };

  if (isValidActivity(activity)) {
    return {
      activity,
      isRandomReviewMode: activity.activity === "review" && urlSearchParams.get("random") === "true",
    };
  }

  window.history.replaceState(null, "", "/");

  return {
    activity: undefined,
    isRandomReviewMode: false,
  };
}
