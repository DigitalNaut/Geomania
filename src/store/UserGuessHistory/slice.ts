import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { startAppListening } from "src/store/listenerMiddleware";
import { LocalStorage } from "src/store/utility/localStorage";
import type { CountryGuess, GuessHistory } from "./types";

const HISTORY_LIMIT = 10;
const HISTORY_KEY = "guessHistory";
const initialState: GuessHistory = [];

function timestampGuess(guess: Omit<CountryGuess, "timestamp">): CountryGuess {
  return {
    ...guess,
    timestamp: Date.now(),
  };
}

export const historyStorage = new LocalStorage<GuessHistory>(HISTORY_KEY);

const userGuessHistory = createSlice({
  name: "userGuessHistory",
  initialState,
  reducers: {
    pushGuessToHistory: (state, { payload }: PayloadAction<Omit<CountryGuess, "timestamp">>) => {
      const newHistory = [...state, timestampGuess(payload)];

      if (newHistory.length > HISTORY_LIMIT) newHistory.shift();

      return newHistory;
    },

    clearGuessHistory: () => initialState,
  },
});

export const { pushGuessToHistory, clearGuessHistory } = userGuessHistory.actions;
export default userGuessHistory.reducer;

startAppListening({
  actionCreator: pushGuessToHistory,
  effect: (_, { getState }) => historyStorage.set(getState().guessHistory),
});
