import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { startAppListening } from "src/store/listenerMiddleware";
import { LocalStorage } from "src/store/utility/localStorage";
import type { CountryStats, CountryStatsPayload } from "./types";
import { CountryStatsSchema } from "./types";

const STATS_KEY = "countryStats";
export const statsStorage = new LocalStorage<CountryStats>(STATS_KEY, CountryStatsSchema);

const initialState: CountryStats = statsStorage.load() ?? CountryStatsSchema.parse(undefined);

const userGuessStatsSlice = createSlice({
  name: "userGuessStats",
  initialState,
  reducers: {
    pushCountryStat: (
      state,
      { payload: { ISO_A2_EH, GU_A3, GEOUNIT, isCorrect } }: PayloadAction<CountryStatsPayload>,
    ) => {
      const country = state[GU_A3];

      const newState: CountryStats = {
        ...state,
        [GU_A3]: {
          GEOUNIT,
          ISO_A2_EH,
          GU_A3,
          correctGuesses: (country?.correctGuesses ?? 0) + (isCorrect ? 1 : 0),
          incorrectGuesses: (country?.incorrectGuesses ?? 0) + (isCorrect ? 0 : 1),
          lastGuessTimestamp: Date.now(),
        },
      };

      return newState;
    },

    clearCountryStats: () => initialState,
  },
});

export const { pushCountryStat, clearCountryStats } = userGuessStatsSlice.actions;
export default userGuessStatsSlice.reducer;

startAppListening({
  actionCreator: pushCountryStat,
  effect: (_, { getState }) => statsStorage.set(getState().guessStats),
});

startAppListening({
  actionCreator: clearCountryStats,
  effect: () => statsStorage.clear(),
});
