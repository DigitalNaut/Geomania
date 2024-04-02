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
import { z } from "zod";

const ActivitySchema = z.enum(["review", "quiz"]);
const ReviewKindSchema = z.enum(["countries"]);
export type ReviewKind = z.infer<typeof ReviewKindSchema>;
const QuizKindSchema = z.enum(["typing", "pointing"]);
export type QuizKind = z.infer<typeof QuizKindSchema>;

export type Activity =
  | {
      mode: "review";
      kind: ReviewKind;
    }
  | {
      mode: "quiz";
      kind: QuizKind;
    };

type MapActivityContext = {
  isRandomReviewMode: boolean;
  setRandomReviewMode: Dispatch<SetStateAction<boolean>>;
  activity?: Activity;
};

const MapActivityContext = createContext<MapActivityContext | null>(null);

function validateReviewKind(kind: string | null): kind is ReviewKind {
  return kind !== null && ReviewKindSchema.safeParse(kind).success;
}

function validateQuizKind(kind: string | null): kind is QuizKind {
  return kind !== null && QuizKindSchema.safeParse(kind).success;
}

function validateActivity(mode: string | null, kind: string | null): Activity | undefined {
  if (!ActivitySchema.safeParse(mode).success) return undefined;

  if (mode === "review" && validateReviewKind(kind)) return { mode: "review", kind };
  else if (mode === "quiz" && validateQuizKind(kind)) return { mode: "quiz", kind };

  return undefined;
}

export default function MapActivityProvider({ children }: PropsWithChildren) {
  const [searchParams, setURLSearchParams] = useSearchParams();
  const activityMode = useMemo(() => searchParams.get("activity"), [searchParams]);
  const activityKind = useMemo(() => searchParams.get("kind"), [searchParams]);
  const isRandomReview = useMemo(() => /^true$/i.test(searchParams.get("random") || ""), [searchParams]);
  const [isRandomReviewMode, setRandomReviewMode] = useState(() => isRandomReview);

  const activity = validateActivity(activityMode, activityKind);

  const setReviewMode: Dispatch<SetStateAction<boolean>> = (value) => {
    setRandomReviewMode(value);
    if (value) searchParams.set("random", "true");
    else searchParams.delete("random");
    setURLSearchParams(searchParams);
  };

  return (
    <MapActivityContext.Provider
      value={{
        isRandomReviewMode,
        setRandomReviewMode: setReviewMode,
        activity,
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
