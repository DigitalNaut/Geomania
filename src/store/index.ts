import { configureStore } from "@reduxjs/toolkit";

import errorLogReducer from "./ErrorLog/slice";
import { listenerMiddleware } from "./listenerMiddleware";
import guessHistoryReducer, { historyStorage } from "./UserGuessHistory/slice";
import userGuessStatsReducer, { statsStorage } from "./UserGuessStats/slice";
import userSettingsReducer, { settingsStorage } from "./UserSettings/slice";
import { UserSettingsSchema } from "./UserSettings/types";

export const store = configureStore({
  preloadedState: {
    errorLog: [],
    settings: settingsStorage.load() ?? UserSettingsSchema.parse(undefined),
    guessHistory: historyStorage.load() ?? [],
    guessStats: statsStorage.load() ?? {},
  },
  reducer: {
    errorLog: errorLogReducer,
    guessHistory: guessHistoryReducer,
    settings: userSettingsReducer,
    guessStats: userGuessStatsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
