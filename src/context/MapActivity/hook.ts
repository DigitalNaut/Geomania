import { createContext, useContext } from "react";

import type { ActivityType } from "src/types/map-activity";

type MapActivityContextType = {
  activity: ActivityType | undefined;
  setActivity: (activity: ActivityType | undefined) => void;
  isRandomReviewMode: boolean;
  setRandomReviewMode: (isRandomReviewMode: boolean) => void;
};

export const MapActivityContext = createContext<MapActivityContextType | null>(null);

export function useMapActivityContext() {
  const context = useContext(MapActivityContext);

  if (!context) {
    throw new Error("'useMapActivityContext' must be used within a 'MapActivityProvider'");
  }

  return context;
}
