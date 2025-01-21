import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { startAppListening } from "src/store/listenerMiddleware";
import { LocalStorage } from "src/store/utility/localStorage";
import type { AtLeastOne } from "src/utils/types";
import type { UserSettings } from "./types";
import { userSettingsSchema } from "./types";

const STATS_KEY = "userSettings";
export const settingsStorage = new LocalStorage<UserSettings>(STATS_KEY);

const initialState = userSettingsSchema.parse({});

const userSettingsSlice = createSlice({
  name: "userSettings",
  initialState,
  reducers: {
    setUserSettings: (state, { payload }: PayloadAction<AtLeastOne<UserSettings>>) => ({ ...state, ...payload }),

    resetUserSettings: () => initialState,
  },
});

export const { setUserSettings, resetUserSettings } = userSettingsSlice.actions;
export default userSettingsSlice.reducer;

startAppListening({
  actionCreator: setUserSettings,
  effect: (action) => settingsStorage.set(action.payload),
});
