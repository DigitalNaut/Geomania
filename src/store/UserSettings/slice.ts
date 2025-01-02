import { createSlice } from "@reduxjs/toolkit";

import type { UserSettings } from "./types";

const initialState: UserSettings = {
  reducedMotion: false,
};

const userSettingsSlice = createSlice({
  name: "userSettings",
  initialState,
  reducers: {
    set: (state, { payload }) => ({ ...state, ...payload }),
    reset: () => initialState,
  },
});

export const { set, reset } = userSettingsSlice.actions;
export default userSettingsSlice.reducer;
