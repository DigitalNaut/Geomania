import { z } from "zod";

export const userSettingsSchema = z.object({
  useReducedMotion: z.boolean().default(false),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

export type ActionType = {
  type: "set" | "reset";
  payload: Partial<UserSettings>;
};