import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { catalogByProperty, pivotTable, shuffleArray } from "src/lib/utils";
import type { ContinentCatalog, CountryCatalog, CountryData } from "src/store/CountryStore/types";
import type { AppThunk } from "..";

import countryData from "src/assets/data/features/countries.json";

export const countryCatalog: CountryCatalog = catalogByProperty(countryData, ({ GU_A3 }) => GU_A3);
export const continentCatalog: ContinentCatalog = pivotTable(countryCatalog, "CONTINENT", ({ GU_A3 }) => GU_A3);
export const continents = Object.keys(continentCatalog).sort();

export type ActivityState = {
  autoRequeue: boolean;
  currentContinent: string | null;
  queue: string[];
  currentCountry: CountryData | null;
  blacklistedCountries: string[] | null;
  visitedCountries: string[];
  shuffle: boolean;
};

type CountryStoreState = {
  quiz: ActivityState;
  review: ActivityState;
};

export const initialState: CountryStoreState = {
  quiz: {
    autoRequeue: true,
    currentCountry: null,
    currentContinent: null,
    queue: [],
    blacklistedCountries: null,
    visitedCountries: [],
    shuffle: true,
  },
  review: {
    autoRequeue: true,
    currentCountry: null,
    currentContinent: null,
    queue: [],
    blacklistedCountries: null,
    visitedCountries: [],
    shuffle: true,
  },
};

type ActivityType = {
  activityType: keyof CountryStoreState;
};

const countryStoreSlice = createSlice({
  name: "countryStore",
  initialState,
  reducers: {
    newQueue(
      state,
      {
        payload: { activityType, continent, shuffle, blacklistedCountries = [] },
      }: PayloadAction<
        ActivityType & {
          continent: string;
          blacklistedCountries: string[];
          shuffle: boolean;
        }
      >,
    ) {
      const activity = state[activityType];
      let newQueue = continentCatalog[continent].slice();

      if (blacklistedCountries.length > 0) {
        newQueue = newQueue.filter((a3) => !blacklistedCountries.includes(a3));
        activity.blacklistedCountries = blacklistedCountries;
      }

      if (shuffle) {
        newQueue = shuffleArray(newQueue);
      } else {
        newQueue.sort();
      }

      activity.currentContinent = continent;
      activity.shuffle = shuffle;

      const nextCountry = newQueue.pop();
      activity.currentCountry = nextCountry ? countryCatalog[nextCountry] : null;
    },

    nextCountryInQueue(state, { payload: { activityType } }: PayloadAction<ActivityType>) {
      const activity = state[activityType];

      if (!activity.currentContinent) return;

      // If the queue is empty, and we're not auto requeueing, then we're done
      if (activity.queue.length === 0) {
        if (!activity.autoRequeue) return;

        // Auto requeue
        activity.queue = continentCatalog[activity.currentContinent].slice();
      }

      const countryA3 = activity.queue[0];

      if (countryA3) {
        const country = countryCatalog[countryA3];
        activity.currentCountry = countryCatalog[country.GU_A3];
      }

      activity.queue = activity.queue.slice(1);
    },

    resetQueue(state, { payload: { activityType: type } }: PayloadAction<ActivityType>) {
      const activityState = state[type];

      if (!activityState.currentContinent) return;

      let newQueue = continentCatalog[activityState.currentContinent].slice();

      if (activityState.blacklistedCountries !== null && activityState.blacklistedCountries.length) {
        newQueue = newQueue.filter((a3) => !activityState.blacklistedCountries?.includes(a3));
      }

      if (activityState.shuffle) {
        newQueue = shuffleArray(newQueue);
      } else {
        newQueue.sort();
      }

      const nextCountry = newQueue[0];
      activityState.currentCountry = nextCountry ? countryCatalog[nextCountry] : null;
      activityState.queue = newQueue.slice(1);
    },

    clearQueue(state, { payload: { activityType: type } }: PayloadAction<ActivityType>) {
      const activity = state[type];
      activity.queue = [];
    },

    blacklistCountry(
      state,
      { payload: { countryA3, type } }: PayloadAction<{ countryA3: string; type: keyof CountryStoreState }>,
    ) {
      const activity = state[type];

      if (activity.blacklistedCountries) {
        activity.blacklistedCountries.push(countryA3);
      } else {
        activity.blacklistedCountries = [countryA3];
      }

      if (activity.queue.length > 0) {
        activity.queue = activity.queue.filter((a3) => a3 !== countryA3) || null;
      }

      return state;
    },

    setCurrentCountryByCode(
      state,
      { payload: { countryA3, activityType: type } }: PayloadAction<ActivityType & { countryA3: string }>,
    ) {
      const activity = state[type];

      if (activity.currentCountry?.GU_A3 === countryA3) return;

      activity.currentCountry = countryCatalog[countryA3];
    },

    clearVisitedCountries(state, { payload: { activityType: type } }: PayloadAction<ActivityType>) {
      const activity = state[type];
      activity.visitedCountries = [];
    },

    addVisitedCountry(
      state,
      { payload: { countryA3: country, activityType: type } }: PayloadAction<ActivityType & { countryA3: string }>,
    ) {
      const activity = state[type];

      if (activity.visitedCountries.includes(country)) return;

      if (activity.visitedCountries) {
        activity.visitedCountries = [...activity.visitedCountries, country];
      } else {
        activity.visitedCountries = [country];
      }
    },
  },
});

export const {
  newQueue,
  clearQueue,
  setCurrentCountryByCode,
  clearVisitedCountries,
  blacklistCountry,
  addVisitedCountry,
} = countryStoreSlice.actions;
export default countryStoreSlice.reducer;

export function getNextCountry(activityType: keyof CountryStoreState): AppThunk<CountryData | null> {
  return function (dispatch, getState) {
    dispatch(countryStoreSlice.actions.nextCountryInQueue({ activityType }));
    const nextCountryA3 = getState().countryStore[activityType].currentCountry?.GU_A3;
    return nextCountryA3 ? countryCatalog[nextCountryA3] : null;
  };
}
