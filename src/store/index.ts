import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";

import type { ActivityType } from "src/store/MapActivity/types";
import mapActivityReducer, { setActivity, setRandomReviewMode } from "./MapActivity/mapActivitySlice";
import { ActivityTypeSchema } from "./MapActivity/types";

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: setActivity,
  effect: function liftStateToURL(action) {
    const searchParams = new URLSearchParams(window.location.search);
    const activity = action.payload?.activity;
    const kind = action.payload?.kind;

    if (activity) searchParams.set("activity", activity);
    if (kind) searchParams.set("kind", kind);

    window.history.replaceState(null, "", `?${searchParams.toString()}`);
  },
});

listenerMiddleware.startListening({
  actionCreator: setRandomReviewMode,
  effect: function liftStateToURL(action) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("random", action.payload.toString());

    window.history.replaceState(null, "", `?${searchParams.toString()}`);
  },
});

function isValidActivity(activity: unknown): activity is ActivityType {
  return ActivityTypeSchema.safeParse(activity).success;
}

function deriveActivityFromURL() {
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

export const store = configureStore({
  reducer: {
    mapActivity: mapActivityReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  preloadedState: {
    mapActivity: deriveActivityFromURL(),
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
