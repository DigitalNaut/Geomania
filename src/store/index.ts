import { configureStore } from "@reduxjs/toolkit";

import { listenerMiddleware } from "./listenerMiddleware";
import guessHistoryReducer, { historyStorage } from "./UserGuessHistory/slice";
import { GuessHistorySchema } from "./UserGuessHistory/types";
import userGuessStatsReducer, { statsStorage } from "./UserGuessStats/slice";
import { CountryStatsSchema } from "./UserGuessStats/types";
import userSettingsReducer, { settingsStorage } from "./UserSettings/slice";
import { userSettingsSchema } from "./UserSettings/types";

export const store = configureStore({
  preloadedState: {
    settings: settingsStorage.load(userSettingsSchema) ?? userSettingsSchema.parse({}),
    guessHistory: historyStorage.load(GuessHistorySchema) ?? [],
    guessStats: statsStorage.load(CountryStatsSchema) ?? {},
  },
  reducer: {
    guessHistory: guessHistoryReducer,
    settings: userSettingsReducer,
    guessStats: userGuessStatsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
