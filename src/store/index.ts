import { configureStore } from "@reduxjs/toolkit";

import mapActivityReducer from "./MapActivity/slice";
import { listenerMiddleware } from "./listenerMiddleware";
import { deriveActivityFromURL } from "./MapActivity/helpers";

export const store = configureStore({
  reducer: {
    mapActivity: mapActivityReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  preloadedState: {
    mapActivity: deriveActivityFromURL(),
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
