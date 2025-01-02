import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { startAppListening } from "src/store/listenerMiddleware.js";
import type { ActivityType, MapActivitySlice } from "./types.js";

const initialState: MapActivitySlice = {
  isRandomReviewMode: false,
  activity: undefined,
};

const mapActivitySlice = createSlice({
  name: "mapActivity",
  initialState,
  reducers: {
    setRandomReviewMode: (state, action: PayloadAction<boolean>) => {
      state.isRandomReviewMode = action.payload;
    },
    setActivity: (state, action: PayloadAction<ActivityType | undefined>) => {
      state.activity = action.payload;
    },
  },
});

export const { setActivity, setRandomReviewMode } = mapActivitySlice.actions;
export default mapActivitySlice.reducer;

startAppListening({
  actionCreator: setActivity,
  effect: function liftStateToURL(action) {
    const searchParams = new URLSearchParams(window.location.search);

    const activity = action.payload?.activity;
    if (activity) searchParams.set("activity", activity);

    const kind = action.payload?.kind;
    if (kind) searchParams.set("kind", kind);

    window.history.pushState(null, "", `?${searchParams.toString()}`);
  },
});

startAppListening({
  actionCreator: setRandomReviewMode,
  effect: function liftStateToURL(action) {
    const searchParams = new URLSearchParams(window.location.search);

    searchParams.set("random", action.payload.toString());

    window.history.pushState(null, "", `?${searchParams.toString()}`);
  },
});
