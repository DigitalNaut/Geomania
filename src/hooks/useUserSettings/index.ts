import { createContext, useContext } from "react";

import type { UserSettingsContextType } from "./types";

export const UserSettingsContext = createContext<UserSettingsContextType | null>(null);

export function useUserSettingsContext() {
  const context = useContext(UserSettingsContext);
  if (!context) throw new Error("useUserSettingsContext must be used within a UserSettingsProvider");

  return context;
}

export { UserSettingsProvider } from "./Provider";
