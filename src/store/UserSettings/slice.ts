import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { startAppListening } from "src/store/listenerMiddleware";
import { LocalStorage } from "src/store/utility/localStorage";
import type { AtLeastOne } from "src/utils/types";
import type { UserSettings } from "./types";
import { UserSettingsSchema } from "./types";

const STATS_KEY = "userSettings";
export const settingsStorage = new LocalStorage<UserSettings | undefined>(STATS_KEY, UserSettingsSchema);

const initialState = settingsStorage.load() ?? UserSettingsSchema.parse(undefined);

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
