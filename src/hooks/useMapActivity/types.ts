import type { Dispatch, SetStateAction } from "react";
import { z } from "zod";

const ReviewKindSchema = z.enum(["countries"]);
const QuizKindSchema = z.enum(["typing", "pointing"]);

export const ActivityTypeSchema = z.union([
  z.object({
    activity: z.literal("review"),
    kind: ReviewKindSchema,
  }),
  z.object({
    activity: z.literal("quiz"),
    kind: QuizKindSchema,
  }),
]);

export type ActivityType = z.infer<typeof ActivityTypeSchema>;
export type ActivityMode = ActivityType["activity"];
export type QuizKind = z.infer<typeof QuizKindSchema>;

export type MapActivityContext = {
  isRandomReviewMode: boolean;
  setRandomReviewMode: Dispatch<SetStateAction<boolean>>;
  activity?: ActivityType;
};
