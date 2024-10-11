import type { Dispatch } from "react";
import { z } from "zod";

export const userSettingsSchema = z.object({
  reducedMotion: z.boolean().default(false),
  autoConnectDrive: z.boolean().default(false),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

export type ActionType = {
  type: "set" | "reset";
  payload: Partial<UserSettings>;
};

export type UserSettingsContext = {
  userSettings: UserSettings;
  setUserSetting: Dispatch<Partial<UserSettings>>;
  resetUserSettings: () => void;
};
