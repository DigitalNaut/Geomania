import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import type { ActivityType } from "./types.js";

export interface MapActivitySlice {
  isRandomReviewMode: boolean;
  activity?: ActivityType;
}

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
