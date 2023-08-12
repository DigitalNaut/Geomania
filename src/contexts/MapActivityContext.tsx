import {
  type Dispatch,
  type SetStateAction,
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
  useMemo,
} from "react";
import { useSearchParams } from "react-router-dom";

const ActivityMode = ["review", "quiz"] as const;
export type ActivityMode = (typeof ActivityMode)[number];

type MapActivityContext = {
  isRandomReviewMode: boolean;
  setRandomReviewMode: Dispatch<SetStateAction<boolean>>;
  activityMode: ActivityMode | null;
};

const MapActivityContext = createContext<MapActivityContext | null>(null);

function isActivityMode(mode: string | null): mode is ActivityMode {
  if (mode === null) return false;
  return ActivityMode.includes(mode as ActivityMode);
}

export default function MapActivityProvider({ children }: PropsWithChildren) {
  const [isRandomReviewMode, setRandomReviewMode] = useState(false);
  const [searchParams] = useSearchParams();
  let activityMode = useMemo(() => searchParams.get("activity"), [searchParams]);

  if (!isActivityMode(activityMode)) {
    activityMode = null;
  }

  return (
    <MapActivityContext.Provider
      value={{
        isRandomReviewMode,
        setRandomReviewMode,
        activityMode,
      }}
    >
      {children}
    </MapActivityContext.Provider>
  );
}

export function useMapActivityContext() {
  const context = useContext(MapActivityContext);
  if (!context) throw new Error("useMapActivityContext must be used within a MapActivityProvider");

  return context;
}
